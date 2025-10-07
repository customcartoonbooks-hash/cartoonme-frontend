import React, { useState, useEffect } from 'react';
import { BookOpen, ArrowRight, Upload, Check, Loader, Palette, Undo2, Redo2, Share2, CheckCircle } from 'lucide-react';

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
  
  // NEW: Session management
  const [sessionId, setSessionId] = useState(null);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [showLinkCopied, setShowLinkCopied] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

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

  // NEW: Check for existing session on load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlSessionId = window.location.pathname.split('/session/')[1]?.split('?')[0];
    
    if (urlSessionId) {
      loadSession(urlSessionId);
    } else {
      setIsLoadingSession(false);
    }
  }, []);

  // NEW: Load existing session
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
        
        // Determine current step
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
        
        console.log('✓ Session loaded successfully');
      } else {
        console.log('Session not found or expired');
        window.history.pushState({}, '', '/');
      }
    } catch (error) {
      console.error('Error loading session:', error);
    }
    setIsLoadingSession(false);
  };

  // NEW: Autosave function
  const autosave = async (updates) => {
    if (!sessionId) return;
    
    try {
      await fetch(`${BACKEND_URL}/api/update-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          updates
        })
      });
      
      // Show brief "saved" indicator
      setShowSavedToast(true);
      setTimeout(() => setShowSavedToast(false), 2000);
      
    } catch (error) {
      console.error('Autosave error:', error);
    }
  };

  // NEW: Copy resume link
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
        
        // NEW: Create session immediately after upload
        try {
          const response = await fetch(`${BACKEND_URL}/api/create-session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uploadedImage: imageData })
          });
          const data = await response.json();
          
          if (data.success) {
            setSessionId(data.sessionId);
            // Update URL without reload
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
    console.log('Selected gender:', gender);
    setSelectedGender(gender);
    
    // NEW: Autosave gender selection
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
        
        const updatedVariationHistory = {
          ...variationHistory,
          [artistIndex]: newHistory
        };
        
        const updatedHistoryIndex = {
          ...historyIndex,
          [artistIndex]: newHistory.length - 1
        };
        
        setVariationHistory(updatedVariationHistory);
        setHistoryIndex(updatedHistoryIndex);
        setGeneratedImages(data.variations);
        
        // NEW: Autosave after generation
        autosave({
          currentArtist: artistIndex,
          variationHistory: updatedVariationHistory,
          historyIndex: updatedHistoryIndex
        });
        
        setCurrentStep('select-variation');
      } else {
        throw new Error('Failed to generate variations');
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
      alert('Maximum 1 shuffle per artist! Please pick one.');
      return;
    }
    const updatedShuffleCount = { ...shuffleCount, [currentArtistGenerating]: currentCount + 1 };
    setShuffleCount(updatedShuffleCount);
    
    // NEW: Autosave shuffle count
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
    
    // NEW: Autosave selection
    autosave({ selectedVariations: newSelections });
    
    const nextArtist = currentArtistGenerating + 1;
    if (nextArtist < artists.length) {
      generateVariationsForArtist(nextArtist);