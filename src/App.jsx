import React, { useState, useEffect, useRef } from 'react';
import { Upload, ArrowRight, Check, Loader, Copy, Home, Undo, Redo, Clock, ChevronLeft, ChevronRight, X, Mail, Phone } from 'lucide-react';
import { Turnstile } from '@marsidev/react-turnstile';

const BACKEND_URL = 'https://cartoonme-backend.onrender.com';
const CLOUDFLARE_SITE_KEY = '0x4AAAAAAB6No5gcHaleduBl';

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
  const [captchaToken, setCaptchaToken] = useState(null);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [selectedProductForImage, setSelectedProductForImage] = useState(null);
  const [verificationStep, setVerificationStep] = useState('input');
  const [contactMethod, setContactMethod] = useState('email');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [contactValue, setContactValue] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [dedication, setDedication] = useState('');
  const codeInputRefs = useRef([]);

  const artists = [
    { 
      name: 'Leonardo da Vinci', 
      period: 'Renaissance',
      malePrompt: 'Renaissance portrait in the style of Leonardo da Vinci\'s Portrait of a Man in Red Chalk, characterized by masterful red-chalk rendering and delicate anatomical precision. The masculine features display calm introspection, strong bone structure, and a serene intellect. Warm terracotta and soft sanguine tones define the drawing\'s lifelike shading, with gentle sfumato transitions enhancing form and volume. The work evokes quiet dignity and philosophical depth, capturing the spirit of human thought through Leonardo\'s meticulous study of proportion, subtle modeling, and naturalistic linework.',
      femalePrompt: 'Renaissance portrait in the style of Leonardo da Vinci\'s Mona Lisa, featuring soft feminine features with delicate sfumato technique, subtle enigmatic smile, serene and mysterious expression, warm golden-brown earth tones, misty atmospheric landscape background, three-quarter view, oil painting on poplar wood, smooth transitions and invisible brushstrokes, contemplative and timeless mood, elegant Renaissance female dress, luminous skin tones with delicate glazes, capturing inner grace and sophistication'
    },
    { 
      name: 'Michelangelo', 
      period: 'Renaissance',
      malePrompt: 'Renaissance portrait inspired by Michelangelo\'s David, translated from marble sculpture to painting with monumental intensity. The male figure embodies idealized beauty and heroic anatomy, with chiseled musculature and divine composure. Strong chiaroscuro emphasizes the sculptural modeling of the face and shoulders, revealing every tension and contour of flesh and form. A palette of marble whites, warm stone, and terracotta hues evokes the monumental presence of the statue, radiating timeless strength and spiritual nobility, merging classical perfection with Renaissance grandeur.',
      femalePrompt: 'Renaissance portrait inspired by Michelangelo\'s female figure studies, idealized feminine anatomy with graceful and statuesque presence, soft yet powerful features, marble-like skin quality, gentle chiaroscuro, flowing drapery, monumental yet delicate composition, classical Roman influence, soft terracotta and cream tones, elegant painterly sculptural quality, timeless feminine grace, Renaissance-inspired attire, serene and poised expression'
    },
    { 
      name: 'Raphael', 
      period: 'High Renaissance',
      malePrompt: 'High Renaissance portrait in the refined manner of Raphael\'s Portrait of Baldassare Castiglione, featuring balanced harmony and noble restraint. The subject\'s masculine features convey intelligence and calm confidence, framed by soft chiaroscuro and a luminous warm tone. Subtle brushwork and a limited palette of blacks, creams, and warm flesh tones create elegant simplicity. The figure sits in poised three-quarter view, radiating cultivated dignity and introspection, encapsulating Raphael\'s ideal of human grace and classical serenity.',
      femalePrompt: 'High Renaissance portrait in the style of Raphael\'s La Donna Velata and Portrait of Maddalena Doni, soft feminine beauty with perfect classical proportions, serene expression with gentle gaze, luminous fair skin with warm flesh tones, elegant three-quarter pose, balanced harmonious composition, Renaissance female fashion with delicate fabrics and jewels, oil on canvas with refined brushwork, idealized grace and dignity, capturing timeless feminine elegance'
    },
    { 
      name: 'Rembrandt', 
      period: 'Baroque',
      malePrompt: 'Baroque portrait in the dramatic style of Rembrandt\'s Self-Portrait, depicting the mature artist\'s mastery of light and introspection. The masculine visage emerges from deep shadow, bathed in warm amber and golden tones. Thick impasto brushwork and layered glazes reveal every crease and contour of age, expressing profound psychological depth. A single light source illuminates the face against a dark, velvety backdrop, emphasizing wisdom, humility, and life experience — a timeless study in self-awareness and the passage of time.',
      femalePrompt: 'Baroque portrait in the dramatic style of Rembrandt, inspired by Portrait of Saskia, soft feminine features illuminated by warm golden light, tender gaze and gentle expression, rich jewel tones with deep reds and golds, soft shadows with luminous highlights, intimate and emotional atmosphere, layered oil painting technique with subtle glazing, elegant luxurious fabrics, conveying warmth, sensitivity, and graceful maturity'
    },
    { 
      name: 'Johannes Vermeer', 
      period: 'Dutch Golden Age',
      malePrompt: 'Dutch Golden Age portrait inspired by Vermeer\'s The Glass of Wine, combining luminous domestic light with contemplative atmosphere. The masculine subject, rendered with crystalline precision, sits in soft daylight near a window, bathed in natural illumination that highlights rich fabrics and refined details. Pearl-like highlights and harmonious composition create serenity within an intimate interior. The scene conveys stillness and quiet dignity, embodying Vermeer\'s mastery of light, texture, and psychological nuance.',
      femalePrompt: 'Dutch Golden Age portrait in the luminous style of Vermeer, inspired by Girl with a Pearl Earring, soft feminine features with calm contemplative expression, mysterious subtle smile, diffused natural window light, pearl-like luminosity on skin, delicate sfumato transitions, intimate domestic interior, detailed period female attire, refined invisible brushwork, harmonious composition, serene timeless beauty, emphasizing gentle elegance and quiet intimacy'
    },
    { 
      name: 'Claude Monet', 
      period: 'Impressionism',
      malePrompt: 'Impressionist portrait in the radiant style of Claude Monet\'s Portrait of Gustave Caillebotte, set against the vibrant seaside light of Jardin à Sainte-Adresse. The masculine figure is captured in natural sunlight with flickering brushstrokes and broken color. Loose painterly marks merge blues, ochres, and greens into a shimmering atmospheric unity. The background evokes an airy coastal breeze and luminous sky, blending figure and nature in a symphony of color and movement, full of spontaneity and plein-air vitality.',
      femalePrompt: 'Impressionist portrait in the style of Claude Monet, inspired by Camille Monet, soft feminine features captured in natural sunlight, loose delicate brushstrokes, vibrant impressionistic colors with pinks, purples, and yellows, light filtering through fabric or flowers, outdoor garden or water lilies background, atmospheric dreamy effect, fleeting moment captured in motion, airy and light-filled composition, impressionistic spontaneity, emphasizing feminine grace in nature'
    },
    { 
      name: 'Vincent van Gogh', 
      period: 'Post-Impressionism',
      malePrompt: 'Post-Impressionist portrait in the expressive style of Van Gogh\'s Self-Portrait, with swirling energetic background inspired by Starry Night, thick impasto brushstrokes creating three-dimensional texture. The masculine features are rendered with bold confident strokes, intense penetrating gaze filled with emotional depth. Vibrant color palette with cobalt blues, chrome yellows, and emerald greens radiates dynamic energy. Heavily textured paint application with characteristic Van Gogh technique, capturing both psychological intensity and expressive power through visible passionate brushwork.',
      femalePrompt: 'Post-Impressionist portrait in the expressive style of Van Gogh, inspired by Portrait of Adeline Ravoux, with swirling energetic background inspired by Starry Night, thick impasto brushstrokes creating rich texture. Soft feminine features with emotional depth and tender expression, vibrant colors of warm peaches, gentle blues, and yellows. Visible energetic paint application with characteristic Van Gogh texture, capturing inner warmth and sensitivity through expressive lively brushwork and radiating movement.'
    },
    { 
      name: 'Edvard Munch', 
      period: 'Expressionism',
      malePrompt: 'Expressionist portrait in the psychological style of Edvard Munch, maintaining recognizable masculine features while conveying emotional intensity. Strong angular bone structure with introspective expression, painted with expressive gestural brushstrokes. The background features flowing atmospheric movement with deep reds and moody blues suggesting psychological depth. Fluid lines and bold color create emotional resonance without extreme distortion. The composition captures inner contemplation and existential mood through Munch\'s characteristic symbolic expressionism, balancing realism with emotional power.',
      femalePrompt: 'Expressionist portrait in the emotional style of Edvard Munch, inspired by Madonna, soft but expressive feminine features with recognizable beauty, introspective or melancholic expression, flowing sensual lines, atmospheric background with emotional movement, bold colors with deep reds and mysterious greens, gestural brushwork, dreamlike and symbolic composition, conveying feminine vulnerability and psychological complexity, haunting yet captivating presence with preserved facial clarity'
    },
    { 
      name: 'Pablo Picasso', 
      period: 'Cubism',
      malePrompt: 'Cubist portrait inspired by Picasso\'s Portrait of Ambroise Vollard, reimagined through overlapping geometric planes and analytical structure. Masculine features are fragmented into angular facets and multiple viewpoints, revealing intellect and form simultaneously. Ochres, muted grays, and warm earth tones create depth without illusion. The composition balances abstraction and identity — a deconstruction of the human face into architecture, rhythm, and balance, expressing modern masculine thought through geometric harmony.',
      femalePrompt: 'Cubist portrait in the revolutionary style of Picasso, inspired by female subjects in Les Demoiselles d\'Avignon, fragmented geometric planes revealing feminine features, multiple viewpoints simultaneously, angular and soft curves combined, deconstructed yet elegant composition, monochromatic palette with subtle ochres, pinks, and grays, flattened perspective, abstracted modern feminine beauty, dynamic overlapping shapes, bold and innovative structure with expressive form'
    },
    { 
      name: 'Salvador Dalí', 
      period: 'Surrealism',
      malePrompt: 'Surrealist portrait inspired by Dalí\'s Self-Portraits, blending hyperrealism with dreamlike invention. The masculine figure is rendered with photographic precision yet distorted by symbolic elements — melting forms, elongated shadows, or architectural illusions. Smooth glazing and luminous golden light suggest both clarity and unreality. Subtle reflections, desert-like backgrounds, and impossible spatial shifts evoke the subconscious world, merging ego, fantasy, and divine absurdity in Dalí\'s visionary style.',
      femalePrompt: 'Surrealist portrait in the dreamlike style of Salvador Dalí, inspired by Gala and female muses, hyperrealistic feminine features with soft porcelain-like skin, fantastical surreal elements, floating or impossible objects, symbolic feminine motifs like roses or pearls, warm golden lighting with soft shadows, uncanny yet graceful composition, meticulous detail, oil painting with smooth flawless technique, otherworldly and imaginative feminine beauty'
    },
    { 
      name: 'Andy Warhol', 
      period: 'Pop Art',
      malePrompt: 'Pop Art portrait in the iconic style of Andy Warhol\'s celebrity series, presenting the male face with bold graphic simplicity and vibrant commercial colors. Flat planes of electric blue, neon yellow, and hot pink create striking contrast through screen-print aesthetic. Bold black outlines and high-contrast silkscreen textures lend mechanical precision and mass-produced allure. The composition transforms identity into pop iconography, fusing fame, consumerism, and modern masculinity — a study in personality through saturated color, graphic clarity, and cultural impact.',
      femalePrompt: 'Pop Art portrait in the iconic style of Andy Warhol, inspired by Marilyn Monroe, bold flat colors and high contrast, simplified feminine features with glamorous appeal, screen-print aesthetic, vibrant artificial palette of hot pinks, electric blues, and bright yellows, graphic composition with repetitive style, poster-like quality, smooth curves and graphic clarity, mass-produced celebrity glamour, contemporary iconic feminine imagery'
    },
    { 
      name: 'Grant Wood', 
      period: 'American Regionalism',
      malePrompt: 'American Regionalist portrait inspired by American Gothic, translating the iconic Midwestern stoicism into painterly form. The male figure stands with resolute posture and plain dignity, rendered in crisp lines and smooth enamel texture. Earthy browns, greens, and muted blues evoke rural honesty and timeless simplicity. The background suggests pastoral farmland or clapboard house geometry, symbolizing steadfast values and quiet resilience — an archetype of American masculine endurance.',
      femalePrompt: 'American Regionalist portrait in the style of Grant Wood, inspired by American Gothic female figure, precise stylized feminine features, strong Midwestern character with gentle dignity, modest expression with subtle charm, clean linear forms with smooth enamel-like finish, warm earth tones with soft pastels, folk art influence, period American dress with apron or simple clothing, timeless portrayal of wholesome and virtuous American femininity'
    }
  ];

  const upsellProducts = [
    {
      name: 'Premium Framed Poster',
      price: 29.99,
      originalPrice: 44.99,
      emoji: '🖼️',
      description: 'Your favorite masterpiece in a beautiful 18x24" frame ready to hang!',
      features: ['Museum-quality print', 'Premium black frame included', 'Ready to hang hardware'],
      color: 'from-blue-50 to-cyan-50',
      borderColor: 'border-blue-200 hover:border-blue-400',
      buttonColor: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      name: 'Custom Cartoon Mug',
      price: 19.99,
      emoji: '☕',
      description: 'Start every morning with your masterpiece! High-quality ceramic mug.',
      features: ['Dishwasher & microwave safe', 'Vibrant, fade-resistant printing', '11oz capacity'],
      color: 'from-pink-50 to-rose-50',
      borderColor: 'border-pink-200 hover:border-pink-400',
      buttonColor: 'bg-pink-600 hover:bg-pink-700'
    },
    {
      name: 'Decorative Throw Pillow',
      price: 24.99,
      emoji: '🛏️',
      description: 'Cozy up with your masterpiece on a soft 16x16" pillow!',
      features: ['Super soft premium fabric', 'Hidden zipper design', 'Machine washable cover'],
      color: 'from-purple-50 to-indigo-50',
      borderColor: 'border-purple-200 hover:border-purple-400',
      buttonColor: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      name: 'Custom Phone Case',
      price: 22.99,
      emoji: '📱',
      description: 'Protect your phone in style with your masterpiece!',
      features: ['Fits iPhone & Samsung models', 'Durable protective case', 'Scratch-resistant finish'],
      color: 'from-yellow-50 to-orange-50',
      borderColor: 'border-yellow-200 hover:border-yellow-400',
      buttonColor: 'bg-orange-600 hover:bg-orange-700'
    },
    {
      name: 'Custom T-Shirt',
      price: 27.99,
      emoji: '👕',
      description: 'Wear your masterpiece! Premium quality tee with your design.',
      features: ['100% cotton comfort', 'All sizes S-3XL available', 'Durable heat-transfer print'],
      color: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-200 hover:border-green-400',
      buttonColor: 'bg-green-600 hover:bg-green-700'
    }
  ];
  useEffect(() => {
    const loadSessionFromUrl = async () => {
      const path = window.location.pathname;
      const urlParams = new URLSearchParams(window.location.search);
      
      const stripeSessionId = urlParams.get('session_id');
      if (stripeSessionId) {
        console.log('✅ Stripe redirect detected! Session ID:', stripeSessionId);
        setOrderNumber('MM' + Date.now().toString().slice(-8));
        
        const sessionMatch = path.match(/\/session\/([^\/\?]+)/);
        if (sessionMatch) {
          setSessionId(sessionMatch[1]);
          console.log('✅ Our session ID:', sessionMatch[1]);
        }
        
        setCurrentStep('success');
        setIsSessionLoading(false);
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
            setCustomerName(session.customer_name || '');
            setDedication(session.dedication || '');
            
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
    if (!captchaToken) {
      alert('Please complete the security check first');
      return;
    }
    
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
          body: JSON.stringify({ 
            uploadedImage: imageData,
            captchaToken: captchaToken 
          })
        });
        
        const data = await response.json();
        if (data.success) {
          setSessionId(data.sessionId);
          setCurrentStep('verify-contact');
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

  const requestVerification = async () => {
    if (!contactValue.trim()) {
      alert(`Please enter your ${contactMethod}`);
      return;
    }

    if (contactMethod === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contactValue)) {
        alert('Please enter a valid email address');
        return;
      }
    }

    if (contactMethod === 'sms') {
      const phoneRegex = /^\+?1?\d{10}$/;
      const cleanPhone = contactValue.replace(/\D/g, '');
      if (!phoneRegex.test(cleanPhone)) {
        alert('Please enter a valid 10-digit phone number');
        return;
      }
    }

    setIsVerifying(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/request-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          [contactMethod]: contactValue
        })
      });

      const data = await response.json();

      if (data.success) {
        setVerificationStep('verify');
        console.log(`✅ Verification code sent to ${contactMethod}`);
      } else {
        alert(data.error || 'Failed to send verification code');
      }
    } catch (error) {
      console.error('❌ Verification request error:', error);
      alert('Failed to send verification code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const verifyCode = async () => {
    const code = verificationCode.join('');
    
    if (code.length !== 6) {
      alert('Please enter the complete 6-digit code');
      return;
    }

    setIsVerifying(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          code
        })
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Code verified successfully');
        setCurrentStep('gender-select');
      } else {
        alert(data.error || 'Invalid code. Please try again.');
        setVerificationCode(['', '', '', '', '', '']);
        if (codeInputRefs.current[0]) {
          codeInputRefs.current[0].focus();
        }
      }
    } catch (error) {
      console.error('❌ Verification error:', error);
      alert('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCodeInput = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    if (value && index < 5) {
      codeInputRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus();
    }
  };

  const selectGender = async (gender) => {
    setSelectedGender(gender);
    await saveSession({ selected_gender: gender, current_artist: 0 });
    setCurrentStep('personalization');
  };

  const generateVariations = async (artistIndex, gender = selectedGender, image = uploadedImage) => {
    setIsGenerating(true);
    setGenerationProgress(0);
    setEstimatedTimeLeft(40);
    
    const artist = artists[artistIndex];
    const selectedPrompt = gender === 'Male' ? artist.malePrompt : artist.femalePrompt;
    const fullPrompt = `${selectedPrompt}, high quality, detailed`;
    
    console.log(`🎨 Generating for ${artist.name}...`);
    console.log('📝 Full prompt:', fullPrompt.substring(0, 100) + '...');
    
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

  const copyLink = () => {
    const url = `${window.location.origin}/session/${sessionId}`;
    navigator.clipboard.writeText(url);
    setShowCopyNotification(true);
    setTimeout(() => setShowCopyNotification(false), 2000);
  };

  const openImageSelector = (product) => {
    setSelectedProductForImage(product);
    setShowImageSelector(true);
  };

  const selectImageForProduct = (artistIdx) => {
    const selectedImage = selectedVariations[artistIdx];
    const artistName = artists[artistIdx].name;
    
    const productWithImage = {
      ...selectedProductForImage,
      selectedImage: selectedImage.url,
      artistName: artistName,
      id: Date.now()
    };
    
    setCartItems([...cartItems, productWithImage]);
    setCartTotal(cartTotal + selectedProductForImage.price);
    setShowImageSelector(false);
    setSelectedProductForImage(null);
    
    alert(`Added ${selectedProductForImage.name} with ${artistName} artwork!`);
  };

  const removeFromCart = (itemId) => {
    const itemToRemove = cartItems.find(item => item.id === itemId);
    if (itemToRemove) {
      setCartItems(cartItems.filter(item => item.id !== itemId));
      setCartTotal(cartTotal - itemToRemove.price);
    }
  };

  const handleCheckout = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/create-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedImages: Object.values(selectedVariations),
          customerEmail: 'customer@example.com',
          sessionId,
          cartItems: cartItems,
          totalAmount: cartTotal
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

      {showImageSelector && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-3xl font-bold">Choose Your Artwork</h3>
              <button
                onClick={() => {
                  setShowImageSelector(false);
                  setSelectedProductForImage(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-8">
              Select which masterpiece to feature on your {selectedProductForImage?.name}
            </p>

            <div className="grid grid-cols-3 md:grid-cols-4 gap-6">
              {Object.entries(selectedVariations).map(([artistIdx, variation]) => {
                const artist = artists[parseInt(artistIdx)];
                return (
                  <button
                    key={artistIdx}
                    onClick={() => selectImageForProduct(parseInt(artistIdx))}
                    className="group relative">
                    <div className="overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition">
                      <img
                        src={variation.url}
                        alt={artist.name}
                        className="w-full h-48 object-cover group-hover:scale-110 transition duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <div className="bg-white rounded-full p-4">
                          <Check className="w-8 h-8 text-amber-600" />
                        </div>
                      </div>
                    </div>
                    <p className="text-center mt-2 font-bold text-sm">{artist.name}</p>
                    <p className="text-center text-xs text-gray-500">{artist.period}</p>
                  </button>
                );
              })}
            </div>
          </div>
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
            onClick={() => {
              if (!captchaToken) {
                alert('Please complete the security check first');
                return;
              }
              document.getElementById('fileInput').click();
            }}
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

          <div className="mt-8 flex justify-center">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <p className="text-center text-sm text-gray-600 mb-4">
                🔒 Security check required before upload
              </p>
              <Turnstile
                siteKey={CLOUDFLARE_SITE_KEY}
                onSuccess={(token) => {
                  setCaptchaToken(token);
                  console.log('✅ Captcha verified');
                }}
                onError={() => {
                  setCaptchaToken(null);
                  alert('Captcha verification failed. Please refresh and try again.');
                }}
                onExpire={() => {
                  setCaptchaToken(null);
                  console.log('⚠️ Captcha expired');
                }}
              />
              {captchaToken && (
                <p className="text-center text-green-600 text-sm mt-2">
                  ✅ Verified! You can now upload
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {currentStep === 'verify-contact' && (
        <section className="max-w-4xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Save Your Progress</h2>
            <p className="text-gray-600">We'll send you a code so you can resume anytime, anywhere</p>
          </div>

          <div className="flex justify-center mb-12">
            <img
              src={uploadedImage}
              alt="Your photo"
              className="w-32 h-32 rounded-full object-cover shadow-xl border-4 border-amber-300"
            />
          </div>

          {verificationStep === 'input' ? (
            <div className="max-w-md mx-auto">
              <div className="bg-white rounded-3xl p-8 shadow-xl">
                <div className="flex gap-4 mb-6">
                  <button
                    onClick={() => setContactMethod('email')}
                    className={`flex-1 py-4 px-6 rounded-xl font-semibold transition ${
                      contactMethod === 'email'
                        ? 'bg-amber-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}>
                    <Mail className="w-5 h-5 inline mr-2" />
                    Email
                  </button>
                  <button
                    onClick={() => setContactMethod('sms')}
                    className={`flex-1 py-4 px-6 rounded-xl font-semibold transition ${
                      contactMethod === 'sms'
                        ? 'bg-amber-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}>
                    <Phone className="w-5 h-5 inline mr-2" />
                    SMS
                  </button>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {contactMethod === 'email' ? 'Email Address' : 'Phone Number'}
                  </label>
                  <input
                    type={contactMethod === 'email' ? 'email' : 'tel'}
                    value={contactValue}
                    onChange={(e) => setContactValue(e.target.value)}
                    placeholder={contactMethod === 'email' ? 'you@example.com' : '+1234567890'}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-amber-600 focus:outline-none"
                    disabled={isVerifying}
                  />
                </div>

                <button
                  onClick={requestVerification}
                  disabled={isVerifying}
                  className="w-full bg-gradient-to-r from-amber-600 to-red-600 text-white py-4 rounded-full font-bold hover:shadow-xl transition disabled:opacity-50">
                  {isVerifying ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader className="w-5 h-5 animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    `Send Verification Code`
                  )}
                </button>

                <p className="text-center text-xs text-gray-500 mt-4">
                  🔒 We'll never spam you or share your info
                </p>
              </div>
            </div>
          ) : (
            <div className="max-w-md mx-auto">
              <div className="bg-white rounded-3xl p-8 shadow-xl">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    {contactMethod === 'email' ? (
                      <Mail className="w-8 h-8 text-amber-600" />
                    ) : (
                      <Phone className="w-8 h-8 text-amber-600" />
                    )}
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Check Your {contactMethod === 'email' ? 'Email' : 'Phone'}!</h3>
                  <p className="text-gray-600">
                    We sent a 6-digit code to<br />
                    <span className="font-semibold">{contactValue}</span>
                  </p>
                </div>

                <div className="flex gap-2 justify-center mb-6">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <input
                      key={index}
                      ref={(el) => (codeInputRefs.current[index] = el)}
                      type="text"
                      maxLength={1}
                      value={verificationCode[index]}
                      onChange={(e) => handleCodeInput(index, e.target.value)}
                      onKeyDown={(e) => handleCodeKeyDown(index, e)}
                      className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:border-amber-600 focus:outline-none"
                      disabled={isVerifying}
                    />
                  ))}
                </div>

                <button
                  onClick={verifyCode}
                  disabled={isVerifying || verificationCode.join('').length !== 6}
                  className="w-full bg-gradient-to-r from-amber-600 to-red-600 text-white py-4 rounded-full font-bold hover:shadow-xl transition disabled:opacity-50 mb-4">
                  {isVerifying ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader className="w-5 h-5 animate-spin" />
                      Verifying...
                    </span>
                  ) : (
                    'Verify & Continue →'
                  )}
                </button>

                <div className="text-center text-sm">
                  <button
                    onClick={() => {
                      setVerificationStep('input');
                      setVerificationCode(['', '', '', '', '', '']);
                    }}
                    className="text-amber-600 hover:text-amber-700 font-semibold">
                    ← Change {contactMethod === 'email' ? 'email' : 'phone'}
                  </button>
                  <span className="text-gray-400 mx-2">|</span>
                  <button
                    onClick={requestVerification}
                    disabled={isVerifying}
                    className="text-amber-600 hover:text-amber-700 font-semibold disabled:opacity-50">
                    Resend code
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {currentStep === 'personalization' && (
        <section className="max-w-4xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Personalize Your Masterpiece</h2>
            <p className="text-gray-600">Add your name and a special dedication (optional)</p>
          </div>

          <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 shadow-xl">
            <div className="mb-8">
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                Your Name (appears on cover)
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter your name"
                maxLength={30}
                className="w-full px-6 py-4 text-2xl text-center border-2 border-amber-300 rounded-xl focus:border-amber-600 focus:outline-none font-bold"
              />
              <p className="text-sm text-gray-500 mt-2 text-center">Max 30 characters</p>
            </div>

            <div className="mb-8">
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                Dedication (optional - appears inside cover)
              </label>
              <textarea
                value={dedication}
                onChange={(e) => setDedication(e.target.value)}
                placeholder="For my amazing family who always believes in me..."
                maxLength={300}
                rows={5}
                className="w-full px-6 py-4 border-2 border-amber-300 rounded-xl focus:border-amber-600 focus:outline-none resize-none"
              />
              <p className="text-sm text-gray-500 mt-2 text-right">{dedication.length}/300 characters</p>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setCurrentStep('gender-select')}
                className="px-8 py-4 bg-gray-200 text-gray-700 rounded-full font-bold hover:bg-gray-300 transition">
                ← Back
              </button>
              <button
                onClick={async () => {
                  if (!customerName.trim()) {
                    alert('Please enter your name');
                    return;
                  }
                  await saveSession({ 
                    customer_name: customerName, 
                    dedication: dedication 
                  });
                  setCurrentStep('generating');
                  generateVariations(0, selectedGender, uploadedImage);
                }}
                className="px-12 py-4 bg-gradient-to-r from-amber-600 to-red-600 text-white rounded-full font-bold hover:shadow-xl transition">
                Start Creating My Book! →
              </button>
            </div>
          </div>

          <div className="mt-8 text-center">
            <div className="inline-block bg-amber-50 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-3">Live Preview:</h3>
              <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg p-8 text-white">
                <p className="text-sm mb-2">if famous artists painted</p>
                <p className="text-4xl font-bold">
                  {customerName || '<your name>'}
                </p>
              </div>
            </div>
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
              onClick={() => {
                setCurrentStep('upsells');
                window.history.pushState({}, '', `/session/${sessionId}?step=upsells`);
              }}
              className="w-full bg-gradient-to-r from-amber-600 to-red-600 text-white py-4 rounded-full font-bold hover:shadow-xl transition">
              Continue to Add-Ons →
            </button>
          </div>
        </section>
      )}

      {currentStep === 'upsells' && (
        <section className="max-w-6xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold mb-4">🎁 Make It Extra Special!</h2>
            <p className="text-2xl text-gray-600 mb-2">Add premium products featuring your artwork</p>
            <p className="text-sm text-gray-500 mt-4">💡 Choose which masterpiece to feature on each product</p>
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
                    <button 
                      onClick={() => openImageSelector(product)} 
                      className={`${product.buttonColor} text-white px-8 py-3 rounded-full font-bold transition`}>
                      Choose Artwork & Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl p-8 mb-8 shadow-xl">
            <h3 className="text-xl font-bold mb-4 text-center">Your Cart</h3>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between py-2 border-b">
                <span>12-Page Masterpiece Book</span>
                <span className="font-bold">$49.99</span>
              </div>
              {cartItems.map((item, idx) => (
                <div key={idx} className="flex justify-between text-green-600 py-2 border-b">
                  <div className="flex-1">
                    <span className="font-semibold">+ {item.name}</span>
                    <p className="text-xs text-gray-500">featuring {item.artistName}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold">${item.price.toFixed(2)}</span>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                      title="Remove from cart">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              <div className="flex justify-between py-4 bg-amber-50 rounded-xl px-4 mt-4">
                <span className="text-xl font-bold">Total:</span>
                <span className="text-3xl font-bold text-amber-600">${cartTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="text-center space-y-4">
            <button onClick={handleCheckout} className="w-full max-w-md bg-gradient-to-r from-amber-600 to-red-600 text-white py-5 rounded-full font-bold text-xl hover:shadow-xl transition">
              Proceed to Secure Checkout →
            </button>
            <button onClick={handleCheckout} className="text-gray-600 hover:text-gray-800 text-sm">
              No thanks, continue with just the book
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">🔒 Secure checkout • 💯 100% satisfaction guarantee • 📦 Free shipping</p>
          </div>
        </section>
      )}
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
                setCustomerName('');
                setDedication('');
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