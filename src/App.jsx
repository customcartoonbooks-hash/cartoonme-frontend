import React, { useState, useEffect } from 'react';
import { BookOpen, ArrowRight, Upload, Check, Loader, Palette, Undo2, Redo2, Share2 } from 'lucide-react';

const MasterpieceMe = () => {
  const [currentStep, setCurrentStep] = useState('home');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [selectedGender, setSelectedGender] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [currentArtistGenerating, setCurrentArtistGenerating] = useState(0);
  const [selectedVariations, setSelectedVariations] = useState({});
  const [shuffleCount, setShuffleCount] = useState({});
  const [variationHistory, setVariationHistory] = useState({});
  const [historyIndex, setHistoryIndex] = useState({});
  const [cartTotal] = useState(49.99);
  
  const [sessionId, setSessionId] = useState(null);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [showLinkCopied, setShowLinkCopied] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [currentGenerationProgress, setCurrentGenerationProgress] = useState(0);

  const BACKEND_URL = 'https://cartoonme-backend.onrender.com';

  const artists = [
    { 
      name: 'Leonardo da Vinci', 
      period: 'Renaissance', 
      years: '1452-1519', 
      emoji: '🎨',
      color: 'bg-amber-700',
      male: { 
        artwork: 'Portrait of a Man in Red Chalk', 
        prompt: 'Portrait in the style of Leonardo da Vinci Portrait of a Man in Red Chalk, Renaissance drawing with sfumato technique, red chalk on paper, male figure, dignified expression, subtle shading, warm earth tones, classical Italian Renaissance style' 
      },
      female: { 
        artwork: 'Mona Lisa', 
        prompt: 'Portrait in the style of Leonardo da Vinci Mona Lisa, Renaissance painting with sfumato technique, soft lighting, oil on wood panel, female figure with subtle enigmatic smile, muted earth tones, misty landscape background, delicate features' 
      }
    },
    { 
      name: 'Michelangelo', 
      period: 'Renaissance', 
      years: '1475-1564', 
      emoji: '⚒️',
      color: 'bg-stone-600',
      male: { 
        artwork: 'David', 
        prompt: 'Portrait in the style of Michelangelo David, Renaissance sculptural painting style, dramatic lighting from above, idealized masculine features, strong bone structure, marble-like skin tones, heroic expression, muscular definition visible in face and neck' 
      },
      female: { 
        artwork: 'Female Sistine Chapel Figures', 
        prompt: 'Portrait in the style of Michelangelo Sistine Chapel female figures, Renaissance fresco style, dramatic chiaroscuro lighting, idealized feminine features, classical beauty, soft yet sculptural rendering, warm flesh tones' 
      }
    },
    { 
      name: 'Raphael', 
      period: 'Renaissance', 
      years: '1483-1520', 
      emoji: '👤',
      color: 'bg-rose-700',
      male: { 
        artwork: 'Portrait of Baldassare Castiglione', 
        prompt: 'Portrait in the style of Raphael Portrait of Baldassare Castiglione, High Renaissance oil painting, male figure, refined gentleman, balanced harmonious composition, soft naturalistic colors, dignified expression, dark clothing with fur trim, muted background' 
      },
      female: { 
        artwork: 'La Donna Velata', 
        prompt: 'Portrait in the style of Raphael La Donna Velata, High Renaissance oil painting, female figure with draped veil, soft idealized features, gentle expression, balanced composition, luminous skin tones, elegant clothing, harmonious colors' 
      }
    },
    { 
      name: 'Rembrandt', 
      period: 'Baroque', 
      years: '1606-1669', 
      emoji: '🕯️',
      color: 'bg-amber-900',
      male: { 
        artwork: 'Self-Portrait', 
        prompt: 'Portrait in the style of Rembrandt self-portraits, Baroque oil painting, male figure, dramatic chiaroscuro lighting, golden brown tones, visible thick brushwork, deep shadows, illuminated face emerging from darkness, psychological depth, rich textures' 
      },
      female: { 
        artwork: 'Portrait of a Young Woman', 
        prompt: 'Portrait in the style of Rembrandt female portraits, Baroque oil painting, female figure, soft golden light, dramatic shadows, rich warm tones, visible brushstrokes, elegant clothing with fine details, contemplative expression' 
      }
    },
    { 
      name: 'Vermeer', 
      period: 'Baroque', 
      years: '1632-1675', 
      emoji: '💎',
      color: 'bg-blue-900',
      male: { 
        artwork: 'Officer and Laughing Girl', 
        prompt: 'Portrait in the style of Vermeer Officer and Laughing Girl, Dutch Golden Age painting, male figure, soft diffused natural light from window, rich colors with ultramarine blue accents, precise detail, balanced composition, warm domestic interior' 
      },
      female: { 
        artwork: 'Girl with a Pearl Earring', 
        prompt: 'Portrait in the style of Vermeer Girl with a Pearl Earring, Dutch Golden Age painting, female figure with pearl earring detail, exotic turban, soft diffused light, dark background, luminous skin, captivating gaze over shoulder, subtle color transitions' 
      }
    },
    { 
      name: 'Claude Monet', 
      period: 'Impressionism', 
      years: '1840-1926', 
      emoji: '🌸',
      color: 'bg-green-600',
      male: { 
        artwork: 'Portrait of Gustave Caillebotte', 
        prompt: 'Portrait in the style of Claude Monet Impressionist portraits, male figure, loose visible brushstrokes, outdoor natural lighting, soft focus, dappled light effects, pastel colors, atmospheric quality, capturing fleeting moment' 
      },
      female: { 
        artwork: 'Portrait of Camille Monet', 
        prompt: 'Portrait in the style of Monet portraits of Camille, Impressionist technique, female figure, loose flowing brushstrokes, soft natural light, outdoor setting, pastel colors, delicate features, capturing light and atmosphere, en plein air quality' 
      }
    },
    { 
      name: 'Vincent van Gogh', 
      period: 'Post-Impressionism', 
      years: '1853-1890', 
      emoji: '🌻',
      color: 'bg-blue-600',
      male: { 
        artwork: 'Self-Portrait', 
        prompt: 'Portrait in the style of Van Gogh self-portraits, Post-Impressionist style, male figure, thick impasto brushstrokes, swirling energetic marks, vibrant blues and yellows, intense gaze, emotional expressiveness, visible brush texture, bold outlines' 
      },
      female: { 
        artwork: 'Portrait of Madame Roulin', 
        prompt: 'Portrait in the style of Van Gogh Portrait of Madame Roulin, Post-Impressionist technique, female figure, thick textured brushstrokes, vibrant contrasting colors, decorative floral background, expressive emotional quality, bold outlines, swirling patterns' 
      }
    },
    { 
      name: 'Edvard Munch', 
      period: 'Expressionism', 
      years: '1863-1944', 
      emoji: '😱',
      color: 'bg-orange-600',
      male: { 
        artwork: 'Male Figure Studies', 
        prompt: 'Portrait in the style of Edvard Munch male figures, Expressionist style, male figure, wavy distorted lines, psychological intensity, somber colors with bold accents, emotional anxiety, elongated features, dark moody atmosphere' 
      },
      female: { 
        artwork: 'The Sick Child', 
        prompt: 'Portrait in the style of Edvard Munch The Sick Child and female figures, Expressionist technique, female figure, flowing distorted lines, psychological depth, muted colors with emotional intensity, melancholic atmosphere, expressive brushwork' 
      }
    },
    { 
      name: 'Pablo Picasso', 
      period: 'Cubism', 
      years: '1881-1973', 
      emoji: '🔷',
      color: 'bg-indigo-600',
      male: { 
        artwork: 'Portrait of Ambroise Vollard', 
        prompt: 'Portrait in the style of Picasso Cubist male portraits, male figure, geometric fragmented face showing multiple angles simultaneously, abstract angular shapes, monochromatic browns and grays, analytical cubism, overlapping planes' 
      },
      female: { 
        artwork: 'Portrait of Dora Maar', 
        prompt: 'Portrait in the style of Picasso portraits of Dora Maar, Cubist technique, female figure, geometric fragmented features, multiple perspectives simultaneously, bold colors, angular shapes, emotional complexity, modernist aesthetic' 
      }
    },
    { 
      name: 'Salvador Dalí', 
      period: 'Surrealism', 
      years: '1904-1989', 
      emoji: '⏰',
      color: 'bg-purple-600',
      male: { 
        artwork: 'Self-Portrait', 
        prompt: 'Portrait in the style of Salvador Dalí self-portraits, Surrealist technique, male figure with characteristic mustache, hyperrealistic facial details with impossible surreal elements, melting distortions, desert landscape, dreamlike quality, precise rendering with bizarre juxtapositions' 
      },
      female: { 
        artwork: 'Portrait of Gala', 
        prompt: 'Portrait in the style of Dalí portraits of Gala, Surrealist technique, female figure, hyperrealistic details combined with dreamlike impossible elements, symbolic imagery, Mediterranean landscape, mystical quality, meticulous rendering with surreal distortions' 
      }
    },
    { 
      name: 'Andy Warhol', 
      period: 'Pop Art', 
      years: '1928-1987', 
      emoji: '🎭',
      color: 'bg-pink-600',
      male: { 
        artwork: 'Elvis Presley', 
        prompt: 'Portrait in the style of Andy Warhol male celebrity portraits, Pop Art style, male figure, high contrast screen print effect, bold flat colors, repeated grid pattern, commercial aesthetic, silkscreen texture, vibrant background' 
      },
      female: { 
        artwork: 'Marilyn Monroe', 
        prompt: 'Portrait in the style of Warhol Marilyn Monroe, Pop Art technique, female figure, high contrast screen print, bright saturated colors, flat graphic style, repeated pattern, glamorous commercial aesthetic, bold outlines, vibrant complementary colors' 
      }
    },
    { 
      name: 'Grant Wood', 
      period: 'American Regionalism', 
      years: '1891-1942', 
      emoji: '🌾',
      color: 'bg-yellow-700',
      male: { 
        artwork: 'American Gothic (male figure)', 
        prompt: 'Portrait in the style of Grant Wood American Gothic male figure, American Regionalism, male figure, precise realistic details, frontal pose, Midwestern farmer aesthetic, clean sharp lines, muted earth tones, serious dignified expression, rural American setting' 
      },
      female: { 
        artwork: 'Portrait of Nan', 
        prompt: 'Portrait in the style of Grant Wood Portrait of Nan, American Regionalism, female figure, precise realistic rendering, frontal composition, Midwestern aesthetic, clean lines, muted colors, gentle dignified expression, rural American sensibility' 
      }
    }
  ];

  useEffect(() => {
    const urlSessionId = window.location.pathname.split('/session/')[1]?.split('?')[0];
    
    if (urlSessionId) {
      loadSession(urlSessionId);
    } else {
      setIsLoadingSession(false);
    }
  }, []);

  const loadSession = async (sid) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/session/${sid}`);
      const data = await response.json();
      
      if (data.success && data.session) {
        const session = data.session;
        setSessionId(sid);
        setUploadedImage(session.uploadedImage);
        setSelectedGender(session.selectedGender);
        setCurrentArtistGenerating(session.currentArtist);
        setSelectedVariations(session.selectedVariations);
        setShuffleCount(session.shuffleCount);
        setVariationHistory(session.variationHistory);
        setHistoryIndex(session.historyIndex);
        
        if (session.selectedGender && Object.keys(session.selectedVariations).length === artists.length) {
          setCurrentStep('preview');
        } else if (session.selectedGender && session.currentArtist > 0) {
          setCurrentStep('select-variation');
          setGeneratedImages(session.variationHistory[session.currentArtist - 1]?.[0] || []);
        } else if (session.selectedGender) {
          startGenerating(session.selectedGender);
        } else if (session.uploadedImage) {
          setCurrentStep('gender-select');
        }
        
        console.log('✓ Session loaded');
      } else {
        window.history.pushState({}, '', '/');
      }
    } catch (error) {
      console.error('Error loading session:', error);
    }
    setIsLoadingSession(false);
  };

  const autosave = async (updates) => {
    if (!sessionId) return;
    
    try {
      await fetch(`${BACKEND_URL}/api/update-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, updates })
      });
      
      setShowSavedToast(true);
      setTimeout(() => setShowSavedToast(false), 2000);
    } catch (error) {
      console.error('Autosave error:', error);
    }
  };

  const copyResumeLink = () => {
    const link = `${window.location.origin}/session/${sessionId}`;
    navigator.clipboard.writeText(link);
    setShowLinkCopied(true);
    setTimeout(() => setShowLinkCopied(false), 3000);
  };

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
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
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
            window.history.pushState({}, '', `/session/${data.sessionId}`);
            console.log('✓ Session created:', data.sessionId);
          }
        } catch (error) {
          console.error('Error creating session:', error);
        }
        
        setCurrentStep('gender-select');
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please upload JPG or PNG only');
    }
  };

  const selectGender = (gender) => {
    setSelectedGender(gender);
    autosave({ selectedGender: gender });
    startGenerating(gender);
  };

  const startGenerating = (gender) => {
    setCurrentArtistGenerating(0);
    setSelectedVariations({});
    setShuffleCount({});
    setVariationHistory({});
    setHistoryIndex({});
    setTimeout(() => generateVariationsForArtist(0, gender), 100);
  };

  const generateVariationsForArtist = async (artistIndex, gender) => {
    setCurrentStep('generating');
    setCurrentArtistGenerating(artistIndex);
    
    try {
      const artist = artists[artistIndex];
      const genderData = (gender || selectedGender) === 'male' ? artist.male : artist.female;
      
      const response = await fetch(`${BACKEND_URL}/api/generate-variations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: uploadedImage,
          artistName: artist.name,
          artistPrompt: genderData.prompt,
          count: 2,
          sessionId
        })
      });
      
      const data = await response.json();
      
      if (data.success && data.variations) {
        const currentHistory = variationHistory[artistIndex] || [];
        const currentIdx = historyIndex[artistIndex] !== undefined ? historyIndex[artistIndex] : currentHistory.length - 1;
        const newHistory = currentHistory.slice(0, currentIdx + 1);
        newHistory.push(data.variations);
        
        const updatedVariationHistory = { ...variationHistory, [artistIndex]: newHistory };
        const updatedHistoryIndex = { ...historyIndex, [artistIndex]: newHistory.length - 1 };
        
        setVariationHistory(updatedVariationHistory);
        setHistoryIndex(updatedHistoryIndex);
        setGeneratedImages(data.variations);
        
        autosave({
          currentArtist: artistIndex,
          variationHistory: updatedVariationHistory,
          historyIndex: updatedHistoryIndex
        });
        
        setCurrentStep('select-variation');
      } else {
        throw new Error('Failed to generate');
      }
    } catch (error) {
      console.error('Generation error:', error);
      alert('Error generating artwork. Please try again.');
      setCurrentStep('upload');
    }
  };

  const shuffleVariations = () => {
    const currentCount = shuffleCount[currentArtistGenerating] || 0;
    if (currentCount >= 1) {
      alert('Maximum 1 shuffle per artist!');
      return;
    }
    const updatedShuffleCount = { ...shuffleCount, [currentArtistGenerating]: currentCount + 1 };
    setShuffleCount(updatedShuffleCount);
    autosave({ shuffleCount: updatedShuffleCount });
    generateVariationsForArtist(currentArtistGenerating);
  };

  const goBackToHistory = () => {
    const history = variationHistory[currentArtistGenerating] || [];
    const currentIdx = historyIndex[currentArtistGenerating] || 0;
    if (currentIdx > 0) {
      const newIndex = currentIdx - 1;
      const updatedHistoryIndex = { ...historyIndex, [currentArtistGenerating]: newIndex };
      setHistoryIndex(updatedHistoryIndex);
      setGeneratedImages(history[newIndex]);
      autosave({ historyIndex: updatedHistoryIndex });
    }
  };

  const goForwardInHistory = () => {
    const history = variationHistory[currentArtistGenerating] || [];
    const currentIdx = historyIndex[currentArtistGenerating] !== undefined ? historyIndex[currentArtistGenerating] : history.length - 1;
    if (currentIdx < history.length - 1) {
      const newIndex = currentIdx + 1;
      const updatedHistoryIndex = { ...historyIndex, [currentArtistGenerating]: newIndex };
      setHistoryIndex(updatedHistoryIndex);
      setGeneratedImages(history[newIndex]);
      autosave({ historyIndex: updatedHistoryIndex });
    }
  };

  const selectVariation = (variation) => {
    const newSelections = { ...selectedVariations, [currentArtistGenerating]: variation };
    setSelectedVariations(newSelections);
    autosave({ selectedVariations: newSelections });
    
    const nextArtist = currentArtistGenerating + 1;
    if (nextArtist < artists.length) {
      generateVariationsForArtist(nextArtist);
    } else {
      setCurrentStep('preview');
    }
  };

  const handleCheckout = async () => {
    const imageUrls = artists.map((_, idx) => selectedVariations[idx]?.url).filter(Boolean);
    const customerEmail = prompt('Enter your email:');
    if (!customerEmail) return;
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/create-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedImages: imageUrls, customerEmail, sessionId })
      });
      const data = await response.json();
      
      if (data.success) {
        window.location.href = data.checkoutUrl;
      } else {
        alert('Checkout failed');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Checkout failed');
    }
  };

  const getProgressPercentage = () => {
    return Math.round((currentArtistGenerating / artists.length) * 100);
  };

  if (isLoadingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-16 h-16 text-amber-700 animate-spin mx-auto mb-4" />
          <p className="text-xl text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="w-8 h-8 text-amber-700" />
              <span className="text-2xl font-bold bg-gradient-to-r from-amber-700 to-rose-700 bg-clip-text text-transparent">MasterpieceMe</span>
            </div>
            <div className="flex items-center gap-4">
              {sessionId && currentStep !== 'home' && (
                <button 
                  onClick={copyResumeLink}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-full hover:bg-amber-200 transition text-sm font-semibold">
                  <Share2 className="w-4 h-4" />
                  Copy Link
                </button>
              )}
              <button onClick={() => setCurrentStep('home')} className="text-gray-600 hover:text-gray-900">Home</button>
            </div>
          </div>
        </div>
      </header>

      {showSavedToast && (
        <div className="fixed top-20 right-4 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <Check className="w-5 h-5" />
          <span className="font-semibold">Saved</span>
        </div>
      )}

      {showLinkCopied && (
        <div className="fixed top-20 right-4 bg-blue-500 text-white px-6 py-4 rounded-lg shadow-lg z-50">
          <p className="font-bold mb-1">✓ Link copied!</p>
          <p className="text-sm">Resume anytime in 30 days</p>
        </div>
      )}

      {currentStep === 'home' && (
        <section className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h1 className="text-7xl font-black mb-6 leading-tight">
              <span className="text-gray-900">See Yourself Painted By</span><br />
              <span className="bg-gradient-to-r from-amber-700 via-rose-700 to-purple-700 bg-clip-text text-transparent">12 Master Artists</span><br />
              <span className="text-5xl text-gray-700">From Renaissance to Modern</span>
            </h1>
            <p className="text-2xl text-gray-800 mb-4 max-w-3xl mx-auto font-semibold">One Portrait → 12 Artistic Interpretations → Your Personal Museum Book</p>
            <button onClick={() => setCurrentStep('upload')} className="bg-gradient-to-r from-amber-700 to-rose-700 text-white px-10 py-5 rounded-full text-xl font-bold hover:shadow-2xl transition-all transform hover:scale-105 inline-flex items-center gap-3">
              <Upload className="w-6 h-6" />Create Your Masterpiece<ArrowRight className="w-6 h-6" />
            </button>
          </div>

          <section className="bg-white py-20 rounded-3xl mb-12 shadow-xl">
            <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-5xl font-black text-center mb-4">12 Legendary Artists Paint <span className="text-amber-700">YOU</span></h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {artists.map((artist, idx) => (
                  <div key={idx} className={artist.color + ' p-6 rounded-2xl text-white shadow-xl hover:scale-105 transition-transform'}>
                    <div className="text-5xl mb-3 text-center">{artist.emoji}</div>
                    <div className="text-center"><div className="font-black text-lg mb-1">{artist.name}</div><div className="text-sm opacity-90">{artist.period}</div></div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="py-20">
            <div className="max-w-md mx-auto bg-gradient-to-br from-amber-700 to-rose-700 rounded-3xl p-10 text-white shadow-2xl">
              <div className="text-center mb-8"><div className="text-7xl font-black mb-3">$49.99</div><div className="text-2xl opacity-90 font-semibold">12-Page Art Book</div></div>
              <ul className="space-y-5 mb-10">
                <li className="flex items-start gap-3"><Check className="w-6 h-6 mt-1 flex-shrink-0" /><span className="text-lg">12 master artists</span></li>
                <li className="flex items-start gap-3"><Check className="w-6 h-6 mt-1 flex-shrink-0" /><span className="text-lg">Gender-specific styles</span></li>
                <li className="flex items-start gap-3"><Check className="w-6 h-6 mt-1 flex-shrink-0" /><span className="text-lg">Museum quality</span></li>
                <li className="flex items-start gap-3"><Check className="w-6 h-6 mt-1 flex-shrink-0" /><span className="text-lg">Hardcover book</span></li>
                <li className="flex items-start gap-3"><Check className="w-6 h-6 mt-1 flex-shrink-0" /><span className="text-lg">FREE shipping</span></li>
              </ul>
              <button onClick={() => setCurrentStep('upload')} className="w-full bg-white text-amber-800 py-5 rounded-full font-black text-xl hover:bg-gray-100 transition shadow-lg">Start Now</button>
            </div>
          </section>
        </section>
      )}

      {currentStep === 'upload' && (
        <section className="bg-white py-20 min-h-screen">
          <div className="max-w-4xl mx-auto px-4">
            <button onClick={() => setCurrentStep('home')} className="text-amber-700 mb-8 flex items-center gap-2 hover:underline font-semibold text-lg">← Back</button>
            <div className="text-center mb-12">
              <h2 className="text-5xl font-black mb-6">Upload Your Portrait</h2>
              <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-6 max-w-2xl mx-auto mb-8">
                <p className="text-lg font-semibold text-amber-900 mb-3">For Best Results:</p>
                <ul className="text-left space-y-2 text-gray-700">
                  <li className="flex items-start gap-2"><span className="text-amber-700 font-bold">•</span><span>High-quality photo</span></li>
                  <li className="flex items-start gap-2"><span className="text-amber-700 font-bold">•</span><span>One person only</span></li>
                  <li className="flex items-start gap-2"><span className="text-amber-700 font-bold">•</span><span>Clear, well-lit face</span></li>
                  <li className="flex items-start gap-2"><span className="text-amber-700 font-bold">•</span><span>No sunglasses</span></li>
                </ul>
              </div>
            </div>
            <input type="file" id="fileInput" accept="image/jpeg,image/png" onChange={handleFileChange} className="hidden" />
            <div onDrop={handleDrop} onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onClick={() => document.getElementById('fileInput').click()} className={'border-4 border-dashed rounded-3xl p-20 text-center transition cursor-pointer ' + (isDragging ? 'border-amber-700 bg-amber-100' : 'border-amber-300 bg-amber-50')}>
              <Upload className="w-20 h-20 text-amber-700 mx-auto mb-6" />
              <h3 className="text-3xl font-black mb-3 text-gray-900">Drop your portrait here</h3>
              <p className="text-gray-600 mb-6 text-lg">or click to browse</p>
              <div className="inline-block bg-gradient-to-r from-amber-700 to-rose-700 text-white px-10 py-4 rounded-full font-bold text-lg shadow-lg">Choose Photo</div>
              <p className="text-sm text-gray-500 mt-6">JPG or PNG • Max 10MB</p>
            </div>
          </div>
        </section>
      )}

      {currentStep === 'gender-select' && (
        <section className="bg-white py-20 min-h-screen">
          <div className="max-w-4xl mx-auto px-4">
            <button onClick={() => setCurrentStep('upload')} className="text-amber-700 mb-8 flex items-center gap-2 hover:underline font-semibold text-lg">← Back</button>
            <div className="text-center mb-12">
              <h2 className="text-5xl font-black mb-6">Select Style</h2>
              <p className="text-xl text-gray-600 mb-8">Choose masterpiece reference</p>
              <div className="flex justify-center gap-4 mb-8"><img src={uploadedImage} alt="Portrait" className="w-32 h-32 object-cover rounded-2xl shadow-lg border-4 border-amber-200" /></div>
            </div>
            <div className="grid grid-cols-2 gap-8 max-w-2xl mx-auto">
              <div onClick={() => selectGender('male')} className="bg-gradient-to-br from-blue-500 to-indigo-600 p-12 rounded-3xl text-white cursor-pointer hover:scale-105 transition-all shadow-2xl text-center">
                <div className="text-7xl mb-4">👨</div>
                <h3 className="text-3xl font-black mb-3">Male</h3>
                <p className="text-sm opacity-90">David, Self-Portraits</p>
              </div>
              <div onClick={() => selectGender('female')} className="bg-gradient-to-br from-pink-500 to-rose-600 p-12 rounded-3xl text-white cursor-pointer hover:scale-105 transition-all shadow-2xl text-center">
                <div className="text-7xl mb-4">👩</div>
                <h3 className="text-3xl font-black mb-3">Female</h3>
                <p className="text-sm opacity-90">Mona Lisa, Gala</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {currentStep === 'generating' && (
        <section className="bg-gradient-to-br from-amber-50 to-rose-50 py-20 min-h-screen flex items-center justify-center">
          <div className="text-center max-w-2xl mx-auto px-4">
            <Loader className="w-32 h-32 text-amber-700 animate-spin mx-auto mb-8" />
            <h2 className="text-5xl font-black mb-6 text-gray-900">Channeling {artists[currentArtistGenerating].name}...</h2>
            <p className="text-2xl text-gray-700 mb-4">{artists[currentArtistGenerating].period} • {artists[currentArtistGenerating].years}</p>
            <p className="text-xl text-gray-600 mb-2">Creating:</p>
            <p className="text-lg font-semibold text-amber-700 mb-8">"{selectedGender === 'male' ? artists[currentArtistGenerating].male.artwork : artists[currentArtistGenerating].female.artwork}"</p>
            
            <div className="bg-white rounded-2xl p-8 shadow-xl mb-6">
              <div className="flex justify-between items-center mb-4">
                <span className="font-black text-amber-700 text-2xl">Artist {currentArtistGenerating + 1} of {artists.length}</span>
                <span className="font-black text-purple-600 text-2xl">{getProgressPercentage()}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-amber-600 to-rose-600 h-full rounded-full transition-all duration-500"
                  style={{ width: getProgressPercentage() + '%' }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 mt-4">Time remaining: ~{Math.ceil((artists.length - currentArtistGenerating) * 0.5)} min</p>
            </div>
            
            <p className="text-sm text-gray-500 bg-white rounded-lg px-4 py-2 inline-block">💾 Auto-saved</p>
          </div>
        </section>
      )}

      {currentStep === 'select-variation' && (
        <section className="bg-white py-20 min-h-screen">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-5xl font-black mb-4 text-gray-900">Pick Your Favorite!</h2>
              <p className="text-xl text-gray-600">{selectedGender === 'male' ? artists[currentArtistGenerating].male.artwork : artists[currentArtistGenerating].female.artwork}</p>
              <div className="mt-6 bg-amber-50 rounded-full px-8 py-4 inline-block border-2 border-amber-300"><span className="text-2xl font-black text-amber-800">Artist {currentArtistGenerating + 1} of {artists.length}</span></div>
            </div>
            <div className="mb-10 flex justify-between items-center max-w-5xl mx-auto bg-gray-50 p-6 rounded-2xl">
              <div className="flex items-center gap-6">
                <img src={uploadedImage} alt="Original" className="w-24 h-24 rounded-xl object-cover border-4 border-amber-300 shadow-lg" />
                <div>
                  <p className="font-black text-2xl text-gray-900 mb-1">{artists[currentArtistGenerating].emoji} {artists[currentArtistGenerating].name}</p>
                  <p className="text-sm text-gray-500 mt-1">Shuffles: {shuffleCount[currentArtistGenerating] || 0}/1</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={goBackToHistory} disabled={!variationHistory[currentArtistGenerating] || (historyIndex[currentArtistGenerating] || 0) === 0} className={'px-6 py-3 rounded-full font-bold transition flex items-center gap-2 ' + (!variationHistory[currentArtistGenerating] || (historyIndex[currentArtistGenerating] || 0) === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-700 text-white hover:bg-gray-800')}>
                  <Undo2 className="w-5 h-5" />Back</button>
                <button onClick={goForwardInHistory} disabled={!variationHistory[currentArtistGenerating] || (historyIndex[currentArtistGenerating] !== undefined ? historyIndex[currentArtistGenerating] : (variationHistory[currentArtistGenerating]?.length || 1) - 1) >= ((variationHistory[currentArtistGenerating]?.length || 1) - 1)} className={'px-6 py-3 rounded-full font-bold transition flex items-center gap-2 ' + (!variationHistory[currentArtistGenerating] || (historyIndex[currentArtistGenerating] !== undefined ? historyIndex[currentArtistGenerating] : (variationHistory[currentArtistGenerating]?.length || 1) - 1) >= ((variationHistory[currentArtistGenerating]?.length || 1) - 1) ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-700 text-white hover:bg-gray-800')}>
                  Forward<Redo2 className="w-5 h-5" /></button>
                <button onClick={shuffleVariations} disabled={(shuffleCount[currentArtistGenerating] || 0) >= 1} className={'px-6 py-3 rounded-full font-bold transition ' + ((shuffleCount[currentArtistGenerating] || 0) >= 1 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-amber-700 text-white hover:bg-amber-800')}>
                  Shuffle ({1 - (shuffleCount[currentArtistGenerating] || 0)} left)</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8 mb-8 max-w-4xl mx-auto">
              {generatedImages.map((img) => (
                <div key={img.id} onClick={() => selectVariation(img)} className="relative cursor-pointer group">
                  <div className="overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all relative">
                    <img src={img.url} alt="Variation" className="w-full h-96 object-contain bg-gray-50 group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="text-white text-4xl font-black opacity-30 transform -rotate-45">PREVIEW</div></div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center"><div className="bg-white rounded-full p-6"><Check className="w-12 h-12 text-amber-700" /></div></div>
                  </div>
                  <p className="text-center mt-3 text-sm font-bold text-gray-700">Click to Select</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {currentStep === 'preview' && (
        <section className="bg-gradient-to-br from-amber-50 to-rose-50 py-20 min-h-screen">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-6xl font-black mb-6 text-gray-900">Your Personal Art Museum!</h2>
              <p className="text-2xl text-gray-700">12 master artists painted YOUR portrait</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-16">
              {artists.map((artist, artistIdx) => {
                const selectedImg = selectedVariations[artistIdx];
                return (
                  <div key={artistIdx} className="bg-white rounded-2xl p-3 shadow-xl hover:shadow-2xl transition-shadow">
                    <img src={selectedImg?.url || ''} alt={'Page ' + (artistIdx + 1)} className="w-full h-64 object-contain bg-gray-50 rounded-xl mb-3" />
                    <div className={artist.color + ' text-white px-3 py-2 rounded-lg text-center'}>
                      <p className="font-black text-sm mb-1">{artist.name}</p>
                      <p className="text-xs opacity-90">{artist.period}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="bg-white rounded-3xl p-10 shadow-2xl mb-8 max-w-md mx-auto">
              <h3 className="text-3xl font-black mb-8 text-center text-gray-900">Order Summary</h3>
              <div className="space-y-6 mb-8">
                <div className="flex justify-between py-4 border-b-2 border-gray-200"><span className="text-lg font-semibold text-gray-700">12-Page Art Book</span><span className="font-black text-xl text-gray-900">$49.99</span></div>
                <div className="flex justify-between py-4"><span className="text-lg font-semibold text-gray-700">Shipping</span><span className="text-green-600 font-black text-lg">FREE</span></div>
                <div className="flex justify-between py-6 bg-amber-50 rounded-xl px-6 border-2 border-amber-200"><span className="font-black text-xl text-gray-900">Total</span><span className="text-4xl font-black text-amber-800">${cartTotal.toFixed(2)}</span></div>
              </div>
              <button onClick={handleCheckout} className="w-full bg-gradient-to-r from-amber-700 to-rose-700 text-white py-6 rounded-full font-black text-xl hover:shadow-2xl transition-all transform hover:scale-105">Proceed to Checkout</button>
            </div>
          </div>
        </section>
      )}

      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Palette className="w-8 h-8 mx-auto mb-3" />
          <span className="text-2xl font-black">MasterpieceMe</span>
          <p className="text-gray-400 mt-3 text-lg">Become the subject of art history</p>
        </div>
      </footer>
    </div>
  );
};

export default MasterpieceMe;