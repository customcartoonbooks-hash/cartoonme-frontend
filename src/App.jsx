import React, { useState, useEffect } from 'react';
import { Upload, ArrowRight, Check, Loader, Copy, Home, Undo, Redo } from 'lucide-react';

const BACKEND_URL = 'https://cartoonme-backend.onrender.com';

export default function MasterpieceMe() {
  const [currentStep, setCurrentStep] = useState('home');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [selectedGender, setSelectedGender] = useState(null);
  const [currentArtist, setCurrentArtist] = useState(0);
  const [generatedImages, setGeneratedImages] = useState({});
  const [selectedVariations, setSelectedVariations] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [shuffleCount, setShuffleCount] = useState({});
  const [variationHistory, setVariationHistory] = useState({});
  const [historyIndex, setHistoryIndex] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [showCopyNotification, setShowCopyNotification] = useState(false);

  const artists = [
    { name: 'Leonardo da Vinci', period: 'Renaissance', prompt: 'Renaissance portrait painting' },
    { name: 'Michelangelo', period: 'Renaissance', prompt: 'Michelangelo sculpture style' },
    { name: 'Raphael', period: 'Renaissance', prompt: 'Raphael classical painting' },
    { name: 'Rembrandt', period: 'Baroque', prompt: 'Rembrandt dramatic lighting portrait' },
    { name: 'Vermeer', period: 'Baroque', prompt: 'Vermeer soft light portrait' },
    { name: 'Claude Monet', period: 'Impressionism', prompt: 'Monet impressionist painting' },
    { name: 'Vincent van Gogh', period: 'Post-Impressionism', prompt: 'Van Gogh expressive brushwork' },
    { name: 'Edvard Munch', period: 'Expressionism', prompt: 'Munch emotional expressionism' },
    { name: 'Pablo Picasso', period: 'Cubism', prompt: 'Picasso cubist portrait' },
    { name: 'Salvador Dalí', period: 'Surrealism', prompt: 'Dali surrealist portrait' },
    { name: 'Andy Warhol', period: 'Pop Art', prompt: 'Warhol pop art portrait' },
    { name: 'Grant Wood', period: 'American Regionalism', prompt: 'Grant Wood American portrait' }
  ];

  // CRITICAL: Load session from URL on mount
  useEffect(() => {
    const loadSessionFromUrl = async () => {
      const path = window.location.pathname;
      const sessionMatch = path.match(/\/session\/([^\/\?]+)/);
      
      if (sessionMatch) {
        const urlSessionId = sessionMatch[1];
        console.log('🔍 Loading session from URL:', urlSessionId);
        
        try {
          const response = await fetch(`${BACKEND_URL}/api/session/${urlSessionId}`);
          const data = await response.json();
          
          if (data.success && data.session) {
            const session = data.session;
            console.log('✅ Session loaded:', session);
            
            // Restore all state
            setSessionId(session.session_id);
            setUploadedImage(session.uploaded_image);
            setSelectedGender(session.selected_gender);
            setCurrentArtist(session.current_artist || 0);
            setGeneratedImages(session.generated_images || {});
            setSelectedVariations(session.selected_variations || {});
            setShuffleCount(session.shuffle_count || {});
            setVariationHistory(session.variation_history || {});
            setHistoryIndex(session.history_index || {});
            
            // Determine which step to show
            if (!session.selected_gender) {
              setCurrentStep('gender-select');
            } else if (session.current_artist < 12) {
              if (session.generated_images && session.generated_images[session.current_artist]) {
                setCurrentStep('select-variation');
              } else {
                setCurrentStep('generating');
                generateVariations(session.current_artist, session.selected_gender);
              }
            } else {
              setCurrentStep('preview');
            }
          }
        } catch (error) {
          console.error('❌ Failed to load session:', error);
        }
      }
    };
    
    loadSessionFromUrl();
  }, []);

  // Save session to database
  const saveSession = async (updates) => {
    if (!sessionId) return;
    
    try {
      console.log('💾 Saving session:', updates);
      const response = await fetch(`${BACKEND_URL}/api/session/${sessionId}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      const data = await response.json();
      if (data.success) {
        console.log('✅ Session saved successfully');
      } else {
        console.error('❌ Session save failed:', data.error);
      }
    } catch (error) {
      console.error('❌ Save error:', error);
    }
  };

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target?.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) processFile(file);
  };

  const processFile = async (file) => {
    if (!file || (file.type !== 'image/jpeg' && file.type !== 'image/png')) {
      alert('Please upload JPG or PNG only');
      return;
    }
    
    if (file.size > 10485760) {
      alert('File too large! Max 10MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageData = e.target.result;
      setUploadedImage(imageData);
      
      // Create session in database
      try {
        const response = await fetch(`${BACKEND_URL}/api/create-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uploadedImage: imageData })
        });
        
        const data = await response.json();
        if (data.success) {
          setSessionId(data.sessionId);
          setCurrentStep('gender-select');
          
          // Update URL without reload
          window.history.pushState({}, '', `/session/${data.sessionId}`);
          console.log('✅ Session created:', data.sessionId);
        }
      } catch (error) {
        console.error('❌ Failed to create session:', error);
        alert('Failed to create session. Please try again.');
      }
    };
    reader.readAsDataURL(file);
  };

  // Select gender and start generation
  const selectGender = async (gender) => {
    setSelectedGender(gender);
    await saveSession({ selectedGender: gender, currentArtist: 0 });
    setCurrentStep('generating');
    generateVariations(0, gender);
  };

  // Generate variations for current artist
  const generateVariations = async (artistIndex, gender = selectedGender) => {
    setIsGenerating(true);
    setGenerationProgress(0);
    
    const artist = artists[artistIndex];
    const genderPrompt = gender === 'Male' ? 'male portrait' : 'female portrait';
    const fullPrompt = `${artist.prompt}, ${genderPrompt}, high quality, detailed`;
    
    console.log(`🎨 Generating for ${artist.name}...`);
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 90) return 90;
        return prev + 10;
      });
    }, 500);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/generate-variations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: uploadedImage,
          artistName: artist.name,
          artistPrompt: fullPrompt,
          count: 2
        })
      });
      
      const data = await response.json();
      clearInterval(progressInterval);
      
      if (data.success) {
        setGenerationProgress(100);
        
        // Save to history
        const newHistory = { ...variationHistory };
        if (!newHistory[artistIndex]) {
          newHistory[artistIndex] = [];
        }
        newHistory[artistIndex].push(data.variations);
        
        const newHistoryIndex = { ...historyIndex, [artistIndex]: newHistory[artistIndex].length - 1 };
        
        setVariationHistory(newHistory);
        setHistoryIndex(newHistoryIndex);
        
        // Update generated images
        const newGeneratedImages = { ...generatedImages, [artistIndex]: data.variations };
        setGeneratedImages(newGeneratedImages);
        
        // Save to database
        await saveSession({
          generatedImages: newGeneratedImages,
          variationHistory: newHistory,
          historyIndex: newHistoryIndex
        });
        
        setTimeout(() => {
          setIsGenerating(false);
          setCurrentStep('select-variation');
        }, 500);
      } else {
        throw new Error(data.error || 'Generation failed');
      }
    } catch (error) {
      clearInterval(progressInterval);
      console.error('❌ Generation error:', error);
      alert('Generation failed. Please try again.');
      setIsGenerating(false);
    }
  };

  // Select variation and move to next artist
  const selectVariation = async (variation) => {
    const newSelections = { ...selectedVariations, [currentArtist]: variation };
    setSelectedVariations(newSelections);
    
    const nextArtist = currentArtist + 1;
    
    // CRITICAL: Save to database BEFORE moving to next artist
    await saveSession({
      selectedVariations: newSelections,
      currentArtist: nextArtist
    });
    
    if (nextArtist < 12) {
      setCurrentArtist(nextArtist);
      setCurrentStep('generating');
      generateVariations(nextArtist);
    } else {
      setCurrentStep('preview');
    }
  };

  // Shuffle variations
  const shuffleVariations = async () => {
    const count = shuffleCount[currentArtist] || 0;
    if (count >= 1) {
      alert('Maximum 1 shuffle per artist');
      return;
    }
    
    const newShuffleCount = { ...shuffleCount, [currentArtist]: count + 1 };
    setShuffleCount(newShuffleCount);
    
    await saveSession({ shuffleCount: newShuffleCount });
    
    setCurrentStep('generating');
    generateVariations(currentArtist);
  };

  // History navigation
  const goBack = () => {
    const history = variationHistory[currentArtist];
    const currentIdx = historyIndex[currentArtist];
    
    if (history && currentIdx > 0) {
      const newIndex = { ...historyIndex, [currentArtist]: currentIdx - 1 };
      setHistoryIndex(newIndex);
      
      const newGeneratedImages = { ...generatedImages, [currentArtist]: history[currentIdx - 1] };
      setGeneratedImages(newGeneratedImages);
      
      saveSession({ generatedImages: newGeneratedImages, historyIndex: newIndex });
    }
  };

  const goForward = () => {
    const history = variationHistory[currentArtist];
    const currentIdx = historyIndex[currentArtist];
    
    if (history && currentIdx < history.length - 1) {
      const newIndex = { ...historyIndex, [currentArtist]: currentIdx + 1 };
      setHistoryIndex(newIndex);
      
      const newGeneratedImages = { ...generatedImages, [currentArtist]: history[currentIdx + 1] };
      setGeneratedImages(newGeneratedImages);
      
      saveSession({ generatedImages: newGeneratedImages, historyIndex: newIndex });
    }
  };

  // Copy link
  const copyLink = () => {
    const url = `${window.location.origin}/session/${sessionId}`;
    navigator.clipboard.writeText(url);
    setShowCopyNotification(true);
    setTimeout(() => setShowCopyNotification(false), 2000);
  };

  // Checkout
  const handleCheckout = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/create-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedImages: Object.values(selectedVariations),
          customerEmail: 'customer@example.com',
          sessionId
        })
      });
      
      const data = await response.json();
      if (data.success) {
        window.location.href = data.checkoutUrl;
      }
    } catch (error) {
      console.error('❌ Checkout error:', error);
      alert('Checkout failed. Please try again.');
    }
  };

  const canGoBack = variationHistory[currentArtist] && historyIndex[currentArtist] > 0;
  const canGoForward = variationHistory[currentArtist] && 
    historyIndex[currentArtist] < variationHistory[currentArtist].length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🎨</span>
            <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-red-600 bg-clip-text text-transparent">
              MasterpieceMe
            </span>
          </div>
          <div className="flex items-center gap-3">
            {sessionId && currentStep !== 'home' && (
              <button
                onClick={copyLink}
                className="flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full font-semibold hover:bg-amber-200 transition">
                <Copy className="w-4 h-4" />
                Copy Link
              </button>
            )}
            <button
              onClick={() => {
                setCurrentStep('home');
                setUploadedImage(null);
                setSessionId(null);
                window.history.pushState({}, '', '/');
              }}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <Home className="w-5 h-5" />
              Home
            </button>
          </div>
        </div>
      </header>

      {showCopyNotification && (
        <div className="fixed top-20 right-4 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg z-50 animate-bounce">
          ✅ Link copied!
        </div>
      )}

      {currentStep === 'home' && (
        <section className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-6xl font-black mb-6">
            Transform Into
            <br />
            <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
              12 Masterpiece Portraits
            </span>
          </h1>
          <p className="text-xl text-gray-700 mb-12 max-w-2xl mx-auto">
            See yourself painted by Leonardo da Vinci, Van Gogh, Picasso, and 9 more legendary artists!
          </p>

          <input
            type="file"
            id="fileInput"
            accept="image/jpeg,image/png"
            onChange={handleFileChange}
            className="hidden"
          />

          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => document.getElementById('fileInput').click()}
            className={`border-4 border-dashed rounded-3xl p-16 cursor-pointer transition ${
              isDragging ? 'border-amber-600 bg-amber-100' : 'border-amber-300 bg-amber-50'
            }`}>
            <Upload className="w-16 h-16 text-amber-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Upload Your Photo</h3>
            <p className="text-gray-600 mb-4">Drag & drop or click to browse</p>
            <div className="inline-block bg-gradient-to-r from-amber-600 to-red-600 text-white px-8 py-3 rounded-full font-semibold">
              Choose File
            </div>
            <p className="text-sm text-gray-500 mt-4">JPG or PNG • Max 10MB</p>
          </div>
        </section>
      )}

      {currentStep === 'gender-select' && (
        <section className="max-w-4xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Select Style</h2>
            <p className="text-gray-600">Choose masterpiece reference</p>
          </div>

          <div className="flex justify-center mb-12">
            <img
              src={uploadedImage}
              alt="Your photo"
              className="w-32 h-32 rounded-full object-cover shadow-xl border-4 border-amber-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
            <button
              onClick={() => selectGender('Male')}
              className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-8 rounded-3xl hover:shadow-2xl transition transform hover:scale-105">
              <div className="text-6xl mb-4">👨</div>
              <div className="text-2xl font-bold mb-2">Male</div>
              <div className="text-sm opacity-90">David, Self-Portraits</div>
            </button>

            <button
              onClick={() => selectGender('Female')}
              className="bg-gradient-to-br from-pink-500 to-rose-600 text-white p-8 rounded-3xl hover:shadow-2xl transition transform hover:scale-105">
              <div className="text-6xl mb-4">👩</div>
              <div className="text-2xl font-bold mb-2">Female</div>
              <div className="text-sm opacity-90">Mona Lisa, Gala</div>
            </button>
          </div>
        </section>
      )}

      {currentStep === 'generating' && (
        <section className="max-w-4xl mx-auto px-4 py-20">
          <div className="text-center">
            <Loader className="w-24 h-24 text-amber-600 animate-spin mx-auto mb-8" />
            <h2 className="text-4xl font-bold mb-4">
              Creating {artists[currentArtist].name} Portrait...
            </h2>
            <p className="text-xl text-gray-600 mb-8">{artists[currentArtist].period}</p>
            
            <div className="max-w-md mx-auto mb-4">
              <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-red-500 h-full transition-all duration-500"
                  style={{ width: `${generationProgress}%` }}
                />
              </div>
            </div>
            <p className="text-sm text-gray-500">{generationProgress}%</p>
            
            <div className="mt-8 bg-white rounded-xl p-4 inline-block">
              <span className="font-bold text-amber-600">
                Artist {currentArtist + 1} of 12
              </span>
            </div>
          </div>
        </section>
      )}

      {currentStep === 'select-variation' && (
        <section className="max-w-6xl mx-auto px-4 py-20">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-4">
              Pick Your Favorite {artists[currentArtist].name}!
            </h2>
            <p className="text-gray-600">{artists[currentArtist].period}</p>
            <div className="mt-4 bg-amber-100 rounded-full px-6 py-3 inline-block">
              <span className="text-xl font-bold text-amber-800">
                Artist {currentArtist + 1} of 12
              </span>
            </div>
          </div>

          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={goBack}
              disabled={!canGoBack}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold ${
                canGoBack
                  ? 'bg-amber-600 text-white hover:bg-amber-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}>
              <Undo className="w-4 h-4" />
              Back
            </button>

            <button
              onClick={shuffleVariations}
              disabled={(shuffleCount[currentArtist] || 0) >= 1}
              className={`px-6 py-2 rounded-full font-semibold ${
                (shuffleCount[currentArtist] || 0) >= 1
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}>
              🔄 Shuffle ({1 - (shuffleCount[currentArtist] || 0)} left)
            </button>

            <button
              onClick={goForward}
              disabled={!canGoForward}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold ${
                canGoForward
                  ? 'bg-amber-600 text-white hover:bg-amber-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}>
              Forward
              <Redo className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-8 max-w-4xl mx-auto">
            {generatedImages[currentArtist]?.map((img) => (
              <div
                key={img.id}
                onClick={() => selectVariation(img)}
                className="relative cursor-pointer group">
                <div className="overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition">
                  <img
                    src={img.url}
                    alt="Variation"
                    className="w-full h-96 object-cover group-hover:scale-110 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <div className="bg-white rounded-full p-6">
                      <Check className="w-12 h-12 text-amber-600" />
                    </div>
                  </div>
                </div>
                <p className="text-center mt-3 font-semibold">Click to Select</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {currentStep === 'preview' && (
        <section className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold mb-4">Your 12 Masterpieces!</h2>
            <p className="text-xl text-gray-600">
              Your portrait by history's greatest artists
            </p>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-4 gap-6 mb-12">
            {Object.entries(selectedVariations).map(([artistIdx, variation]) => {
              const artist = artists[parseInt(artistIdx)];
              return (
                <div key={artistIdx} className="bg-white rounded-xl p-3 shadow-lg">
                  <img
                    src={variation.url}
                    alt={artist.name}
                    className="w-full h-64 object-cover rounded-lg mb-2"
                  />
                  <p className="text-center font-bold text-sm">{artist.name}</p>
                  <p className="text-center text-xs text-gray-500">{artist.period}</p>
                </div>
              );
            })}
          </div>

          <div className="max-w-md mx-auto bg-white rounded-3xl p-8 shadow-xl">
            <h3 className="text-2xl font-bold mb-6 text-center">Order Summary</h3>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between py-3 border-b">
                <span>12-Page Masterpiece Book</span>
                <span className="font-bold">$49.99</span>
              </div>
              <div className="flex justify-between py-3">
                <span>Shipping</span>
                <span className="text-green-600 font-semibold">FREE</span>
              </div>
              <div className="flex justify-between py-4 bg-amber-50 rounded-xl px-4">
                <span className="font-bold">Total</span>
                <span className="text-2xl font-bold text-amber-600">$49.99</span>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-gradient-to-r from-amber-600 to-red-600 text-white py-4 rounded-full font-bold hover:shadow-xl transition">
              Proceed to Checkout
            </button>
          </div>
        </section>
      )}

      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <span className="text-2xl">🎨</span>
          <p className="text-xl font-bold mt-2">MasterpieceMe</p>
          <p className="text-gray-400 mt-2">Transform into legendary artwork</p>
        </div>
      </footer>
    </div>
  );
}