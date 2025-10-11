import React, { useState, useEffect } from 'react';
import { Upload, ArrowRight, Check, Loader, Copy, Home, Undo, Redo, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

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
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  const [estimatedTimeLeft, setEstimatedTimeLeft] = useState(40);
  const [isSessionLoading, setIsSessionLoading] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(49.99);
  const [orderNumber, setOrderNumber] = useState(null);
  const [currentBookPage, setCurrentBookPage] = useState(0);

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

  const upsellProducts = [
    {
      name: 'Premium Framed Poster',
      price: 29.99,
      originalPrice: 44.99,
      emoji: '🖼️',
      description: 'Your favorite cartoon in a beautiful 18x24" frame ready to hang!',
      features: ['Museum-quality print', 'Premium black frame included', 'Ready to hang hardware'],
      color: 'from-blue-50 to-cyan-50',
      borderColor: 'border-blue-200 hover:border-blue-400',
      buttonColor: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      name: 'Custom Cartoon Mug',
      price: 19.99,
      emoji: '☕',
      description: 'Start every morning with your cartoon self! High-quality ceramic mug.',
      features: ['Dishwasher & microwave safe', 'Vibrant, fade-resistant printing', '11oz capacity'],
      color: 'from-pink-50 to-rose-50',
      borderColor: 'border-pink-200 hover:border-pink-400',
      buttonColor: 'bg-pink-600 hover:bg-pink-700'
    },
    {
      name: 'Decorative Throw Pillow',
      price: 24.99,
      emoji: '🛏️',
      description: 'Cozy up with your cartoon on a soft 16x16" pillow!',
      features: ['Super soft premium fabric', 'Hidden zipper design', 'Machine washable cover'],
      color: 'from-purple-50 to-indigo-50',
      borderColor: 'border-purple-200 hover:border-purple-400',
      buttonColor: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      name: 'Custom Phone Case',
      price: 22.99,
      emoji: '📱',
      description: 'Protect your phone in style with your cartoon!',
      features: ['Fits iPhone & Samsung models', 'Durable protective case', 'Scratch-resistant finish'],
      color: 'from-yellow-50 to-orange-50',
      borderColor: 'border-yellow-200 hover:border-yellow-400',
      buttonColor: 'bg-orange-600 hover:bg-orange-700'
    },
    {
      name: 'Custom T-Shirt',
      price: 27.99,
      emoji: '👕',
      description: 'Wear your cartoon! Premium quality tee with your design.',
      features: ['100% cotton comfort', 'All sizes S-3XL available', 'Durable heat-transfer print'],
      color: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-200 hover:border-green-400',
      buttonColor: 'bg-green-600 hover:bg-green-700'
    }
  ];

  // Load session from URL on mount
  useEffect(() => {
    const loadSessionFromUrl = async () => {
      const path = window.location.pathname;
      const urlParams = new URLSearchParams(window.location.search);
      
      // Check for success page
      if (urlParams.get('success') === 'true') {
        const sessionMatch = path.match(/\/session\/([^\/\?]+)/);
        if (sessionMatch) {
          setSessionId(sessionMatch[1]);
          setOrderNumber('MM' + Date.now().toString().slice(-8));
          setCurrentStep('success');
        }
        return;
      }
      
      const sessionMatch = path.match(/\/session\/([^\/\?]+)/);
      
      if (sessionMatch && !isSessionLoading) {
        const urlSessionId = sessionMatch[1];
        console.log('🔍 Loading session from URL:', urlSessionId);
        setIsSessionLoading(true);
        
        try {
          const response = await fetch(`${BACKEND_URL}/api/session/${urlSessionId}`);
          const data = await response.json();
          
          const session = data;
          
          console.log('✅ Session loaded:', session);
          
          if (session && session.uploaded_image) {
            setSessionId(session.session_id);
            setSelectedGender(session.selected_gender);
            setCurrentArtist(session.current_artist || 0);
            setShuffleCount(session.shuffle_count || {});
            setVariationHistory(session.variation_history || {});
            setHistoryIndex(session.history_index || {});
            
            const parsedGeneratedImages = typeof session.generated_images === 'string' 
              ? JSON.parse(session.generated_images) 
              : (session.generated_images || {});
            const parsedSelectedVariations = typeof session.selected_variations === 'string'
              ? JSON.parse(session.selected_variations)
              : (session.selected_variations || {});
            
            setGeneratedImages(parsedGeneratedImages);
            setSelectedVariations(parsedSelectedVariations);
            setUploadedImage(session.uploaded_image);
            
            const currentArtistNum = session.current_artist || 0;
            
            if (!session.selected_gender) {
              setCurrentStep('gender-select');
            } else if (currentArtistNum >= 12) {
              setCurrentStep('preview');
            } else if (parsedGeneratedImages[currentArtistNum]) {
              setCurrentStep('select-variation');
            } else {
              setCurrentStep('generating');
              setTimeout(() => {
                generateVariations(currentArtistNum, session.selected_gender, session.uploaded_image);
              }, 500);
            }
          } else {
            setCurrentStep('home');
          }
        } catch (error) {
          console.error('❌ Failed to load session:', error);
          setCurrentStep('home');
        } finally {
          setIsSessionLoading(false);
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
      setShowSaveNotification(true);
      
      const response = await fetch(`${BACKEND_URL}/api/session/${sessionId}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      const data = await response.json();
      if (data.success) {
        console.log('✅ Session saved successfully');
        setTimeout(() => setShowSaveNotification(false), 2000);
      }
    } catch (error) {
      console.error('❌ Save error:', error);
      setShowSaveNotification(false);
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
    await saveSession({ selected_gender: gender, current_artist: 0 });
    setCurrentStep('generating');
    generateVariations(0, gender, uploadedImage);
  };

  // Generate variations
  const generateVariations = async (artistIndex, gender = selectedGender, image = uploadedImage) => {
    setIsGenerating(true);
    setGenerationProgress(0);
    setEstimatedTimeLeft(40);
    
    const artist = artists[artistIndex];
    const genderPrompt = gender === 'Male' ? 'male portrait' : 'female portrait';
    const fullPrompt = `${artist.prompt}, ${genderPrompt}, high quality, detailed`;
    
    console.log(`🎨 Generating for ${artist.name}...`);
    
    const startTime = Date.now();
    
    const progressInterval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const estimatedTotal = 40;
      const remaining = Math.max(0, Math.ceil(estimatedTotal - elapsed));
      setEstimatedTimeLeft(remaining);
      
      const progress = Math.min(95, (elapsed / estimatedTotal) * 100);
      setGenerationProgress(Math.floor(progress));
    }, 100);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/generate-variations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: image,
          artistName: artist.name,
          artistPrompt: fullPrompt,
          count: 2
        })
      });
      
      const data = await response.json();
      clearInterval(progressInterval);
      
      if (data.success) {
        setGenerationProgress(100);
        setEstimatedTimeLeft(0);
        
        const newHistory = { ...variationHistory };
        if (!newHistory[artistIndex]) {
          newHistory[artistIndex] = [];
        }
        newHistory[artistIndex].push(data.variations);
        
        const newHistoryIndex = { ...historyIndex, [artistIndex]: newHistory[artistIndex].length - 1 };
        
        setVariationHistory(newHistory);
        setHistoryIndex(newHistoryIndex);
        
        const newGeneratedImages = { ...generatedImages, [artistIndex]: data.variations };
        setGeneratedImages(newGeneratedImages);
        
        await saveSession({
          generated_images: newGeneratedImages,
          variation_history: newHistory,
          history_index: newHistoryIndex,
          current_artist: artistIndex
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

  // Select variation
  const selectVariation = async (variation) => {
    const newSelections = { ...selectedVariations, [currentArtist]: variation };
    setSelectedVariations(newSelections);
    
    const nextArtist = currentArtist + 1;
    
    await saveSession({
      selected_variations: newSelections,
      current_artist: nextArtist
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
    
    await saveSession({ shuffle_count: newShuffleCount });
    
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
      
      saveSession({ generated_images: newGeneratedImages, history_index: newIndex });
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
      
      saveSession({ generated_images: newGeneratedImages, history_index: newIndex });
    }
  };

  // Copy link
  const copyLink = () => {
    const url = `${window.location.origin}/session/${sessionId}`;
    navigator.clipboard.writeText(url);
    setShowCopyNotification(true);
    setTimeout(() => setShowCopyNotification(false), 2000);
  };

  // Add to cart
  const addToCart = (product) => {
    setCartItems([...cartItems, product]);
    setCartTotal(cartTotal + product.price);
    alert(`Added ${product.name} to cart!`);
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
            {sessionId && currentStep !== 'home' && currentStep !== 'success' && (
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

      {showSaveNotification && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-6 py-3 rounded-full shadow-lg z-50 flex items-center gap-2">
          <Check className="w-4 h-4" />
          Autosaved
        </div>
      )}

      {/* HOME */}
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

      {/* GENDER SELECT */}
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

      {/* GENERATING */}
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
                  className="bg-gradient-to-r from-amber-500 to-red-500 h-full transition-all duration-300"
                  style={{ width: `${generationProgress}%` }}
                />
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-4">{generationProgress}%</p>
            
            {estimatedTimeLeft > 0 && (
              <div className="flex items-center justify-center gap-2 text-gray-600 mb-6">
                <Clock className="w-4 h-4" />
                <span>{estimatedTimeLeft} seconds remaining</span>
              </div>
            )}
            
            <div className="mt-8 bg-white rounded-xl p-4 inline-block">
              <span className="font-bold text-amber-600">
                Artist {currentArtist + 1} of 12
              </span>
            </div>
          </div>
        </section>
      )}

      {/* SELECT VARIATION */}
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

      {/* PREVIEW WITH BOOK VIEWER */}
      {currentStep === 'preview' && (
        <section className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold mb-4">Your 12 Masterpieces!</h2>
            <p className="text-xl text-gray-600">
              Your portrait by history's greatest artists
            </p>
          </div>

          {/* Grid Preview */}
          <div className="grid grid-cols-3 md:grid-cols-4 gap-6 mb-16">
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

          {/* Book Preview */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-center mb-8">📖 Book Preview</h3>
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl shadow-2xl p-8">
                {selectedVariations[currentBookPage] && (
                  <>
                    <img 
                      src={selectedVariations[currentBookPage].url} 
                      alt={`Page ${currentBookPage + 1}`}
                      className="w-full h-96 object-cover rounded-lg mb-4"
                    />
                    <div className="text-center">
                      <p className="text-2xl font-bold mb-2">{artists[currentBookPage].name}</p>
                      <p className="text-gray-600">{artists[currentBookPage].period}</p>
                      <p className="text-sm text-gray-500 mt-2">Page {currentBookPage + 1} of 12</p>
                    </div>
                  </>
                )}
              </div>
              <div className="flex justify-between items-center mt-6">
                <button 
                  onClick={() => setCurrentBookPage(Math.max(0, currentBookPage - 1))}
                  disabled={currentBookPage === 0}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold ${currentBookPage === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-amber-600 text-white hover:bg-amber-700'}`}>
                  <ChevronLeft className="w-5 h-5" /> Previous
                </button>
                <button 
                  onClick={() => setCurrentBookPage(Math.min(11, currentBookPage + 1))}
                  disabled={currentBookPage === 11}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold ${currentBookPage === 11 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-amber-600 text-white hover:bg-amber-700'}`}>
                  Next <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="max-w-md mx-auto bg-white rounded-3xl p-8 shadow-xl mb-8">
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
              onClick={() => setCurrentStep('upsells')}
              className="w-full bg-gradient-to-r from-amber-600 to-red-600 text-white py-4 rounded-full font-bold hover:shadow-xl transition">
              Continue to Add-Ons →
            </button>
          </div>
        </section>
      )}

      {/* UPSELLS */}
      {currentStep === 'upsells' && (
        <section className="max-w-6xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold mb-4">🎁 Make It Extra Special!</h2>
            <p className="text-2xl text-gray-600 mb-2">Add premium products featuring your artwork</p>
          </div>

          <div className="space-y-6 mb-12">
            {upsellProducts.map((product, idx) => (
              <div key={idx} className={`bg-gradient-to-r ${product.color} rounded-2xl p-8 border-2 ${product.borderColor} transition hover:shadow-xl`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-5xl mb-3">{product.emoji}</div>
                    <h3 className="text-2xl font-bold mb-2">{product.name}</h3>
                    <p className="text-gray-600 mb-4">{product.description}</p>
                    <ul className="space-y-2 text-sm">
                      {product.features.map((feature, i) => (
                        <li key={i}>✓ {feature}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="text-right ml-8">
                    {product.originalPrice && (
                      <div className="text-sm text-gray-500 line-through mb-1">${product.originalPrice}</div>
                    )}
                    <div className="text-4xl font-bold text-gray-900 mb-3">${product.price}</div>
                    <button onClick={() => addToCart(product)} className={`${product.buttonColor} text-white px-8 py-3 rounded-full font-bold transition`}>
                      Add to Order
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="bg-white rounded-2xl p-8 mb-8 shadow-xl">
            <h3 className="text-xl font-bold mb-4 text-center">Your Cart</h3>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between py-2 border-b">
                <span>12-Page Masterpiece Book</span>
                <span className="font-bold">$49.99</span>
              </div>
              {cartItems.map((item, idx) => (
                <div key={idx} className="flex justify-between text-green-600 py-2">
                  <span>+ {item.name}</span>
                  <span className="font-bold">${item.price.toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between py-4 bg-amber-50 rounded-xl px-4 mt-4">
                <span className="text-xl font-bold">Total:</span>
                <span className="text-3xl font-bold text-amber-600">${cartTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="text-center space-y-4">
            <button onClick={handleCheckout} className="w-full max-w-md bg-gradient-to-r from-amber-600 to-red-600 text-white py-5 rounded-full font-bold text-xl hover:shadow-xl transition">
              Proceed to Secure Checkout →
            </button>
            <button onClick={handleCheckout} className="text-gray-600 hover:text-gray-800 text-sm">
              No thanks, continue with just the book
            </button>
          </div>
        </section>
      )}

      {/* SUCCESS PAGE */}
      {currentStep === 'success' && (
        <section className="max-w-4xl mx-auto px-4 py-20">
          <div className="bg-white rounded-3xl p-12 shadow-2xl text-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-12 h-12 text-green-600" />
            </div>
            
            <h1 className="text-5xl font-bold mb-4">Order Confirmed! 🎉</h1>
            <p className="text-2xl text-gray-600 mb-8">Thank you for your purchase!</p>
            
            <div className="bg-amber-50 rounded-2xl p-6 mb-8">
              <p className="text-sm text-gray-600 mb-2">Order Number</p>
              <p className="text-3xl font-bold text-amber-600">{orderNumber}</p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left">
              <h3 className="text-xl font-bold mb-4">What happens next?</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center flex-shrink-0">1</div>
                  <div>
                    <p className="font-semibold">Confirmation Email Sent</p>
                    <p className="text-sm text-gray-600">Check your inbox for order details</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center flex-shrink-0">2</div>
                  <div>
                    <p className="font-semibold">Book Production Begins</p>
                    <p className="text-sm text-gray-600">Your custom book will be printed with premium quality</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center flex-shrink-0">3</div>
                  <div>
                    <p className="font-semibold">Ships Within 5-7 Business Days</p>
                    <p className="text-sm text-gray-600">You'll receive tracking information via email</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center flex-shrink-0">4</div>
                  <div>
                    <p className="font-semibold">Delivered to Your Door</p>
                    <p className="text-sm text-gray-600">Free shipping included!</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <p className="text-gray-600 mb-6">Questions about your order?</p>
              <p className="text-sm text-gray-500">Contact us at support@masterpieceme.com</p>
            </div>

            <button 
              onClick={() => { 
                setCurrentStep('home'); 
                setUploadedImage(null);
                setSessionId(null);
                setCartItems([]);
                setCartTotal(49.99);
                window.history.pushState({}, '', '/'); 
              }} 
              className="mt-8 bg-gradient-to-r from-amber-600 to-red-600 text-white px-12 py-4 rounded-full font-bold hover:shadow-xl transition">
              Create Another Book
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