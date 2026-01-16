import React, { useState, useEffect, useRef } from 'react';
import { Upload, ArrowRight, Check, Loader, Copy, Undo, Redo, Clock, ChevronLeft, ChevronRight, X, Mail, Phone, Edit2 } from 'lucide-react';
import { Turnstile } from '@marsidev/react-turnstile';
import CoverTypeSelector from './components/CoverTypeSelector';

const BACKEND_URL = 'https://cartoonme-backend.onrender.com';
const CLOUDFLARE_SITE_KEY = '0x4AAAAAAB6No5gcHaleduBl';
const TURNSTILE_SITE_KEY = CLOUDFLARE_SITE_KEY;

// Analytics tracking utility
const trackEvent = async (eventType, metadata = {}) => {
  try {
    // Get or create visitor ID (persists across sessions)
    let visitorId = localStorage.getItem('visitorId');
    if (!visitorId) {
      visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('visitorId', visitorId);
    }
    
    await fetch(`${BACKEND_URL}/api/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: eventType,
        visitorId,
        sessionId: sessionStorage.getItem('sessionId'),
        metadata
      })
    });
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
};

export default function BuildaBook() {
  const [currentStep, setCurrentStep] = useState('home');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [coverType, setCoverType] = useState('hardcover');
  const [coverColor, setCoverColor] = useState('blue');
  const [price, setPrice] = useState(49.99);
  const [sessionId, setSessionId] = useState(null);
  const [selectedGender, setSelectedGender] = useState(null);
  const [currentArtist, setCurrentArtist] = useState(0);
  const [generatedImages, setGeneratedImages] = useState({});
  const [selectedVariations, setSelectedVariations] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [batchGenerating, setBatchGenerating] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [shuffleCount, setShuffleCount] = useState({});
  const [variationHistory, setVariationHistory] = useState({});
  const [historyIndex, setHistoryIndex] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [showCopyNotification, setShowCopyNotification] = useState(false);
  const [showCopiedNotification, setShowCopiedNotification] = useState(false);
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  const [showAutosaveNotification, setShowAutosaveNotification] = useState(false);
  const [estimatedTimeLeft, setEstimatedTimeLeft] = useState(40);
  const [isSessionLoading, setIsSessionLoading] = useState(false);
  const [orderNumber, setOrderNumber] = useState(null);
  const [currentBookPage, setCurrentBookPage] = useState(0);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [verificationStep, setVerificationStep] = useState('input');
  const [verificationSent, setVerificationSent] = useState(false);
  const [contactVerified, setContactVerified] = useState(false);
  const [contactMethod, setContactMethod] = useState('email');
  const [email, setEmail] = useState('');
  const [sms, setSms] = useState('');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [verificationError, setVerificationError] = useState('');
  const [contactValue, setContactValue] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [dedication, setDedication] = useState('');
  
  // Homepage book preview slideshow
  const [homepageArtistIndex, setHomepageArtistIndex] = useState(0);
  const [isBookOpen, setIsBookOpen] = useState(false);
  
  // Smart counter that syncs across all users via backend
  const [masterpieceCount, setMasterpieceCount] = useState(1250); // Default value
  
  // Generate unique user session ID
  const getUserSessionId = () => {
    let sessionId = sessionStorage.getItem('userSessionId');
    if (!sessionId) {
      sessionId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('userSessionId', sessionId);
    }
    return sessionId;
  };
  
  // Send heartbeat and fetch counter - only while user is on page
  useEffect(() => {
    const userId = getUserSessionId();
    let isActive = true; // Prevent race conditions
    
    const sendHeartbeat = async () => {
      if (!isActive) return; // Don't send if component unmounted
      
      try {
        const response = await fetch(`${BACKEND_URL}/api/counter/heartbeat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        });
        
        if (!isActive) return; // Don't update state if unmounted
        
        const data = await response.json();
        setMasterpieceCount(data.count);
      } catch (error) {
        if (isActive) {
          console.error('Failed to send heartbeat:', error);
        }
      }
    };
    
    // Send initial heartbeat
    sendHeartbeat();
    
    // Send heartbeat every 30 seconds while user is on page
    const heartbeatInterval = setInterval(sendHeartbeat, 30000);
    
    return () => {
      isActive = false; // Mark as inactive
      clearInterval(heartbeatInterval); // Clear the interval
    };
  }, []); // Empty array = run once on mount
  
  // List of all 12 artists for slideshow
  const artistSlideshow = [
    'vangogh', 'davinci', 'michelangelo', 'raphael', 
    'rembrandt', 'vermeer', 'monet', 'munch', 
    'picasso', 'dali', 'warhol', 'grantwood'
  ];
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedModalImage, setSelectedModalImage] = useState(null);
  const [showEditDedication, setShowEditDedication] = useState(false);
  const [editedDedication, setEditedDedication] = useState('');
  const [showArtistModal, setShowArtistModal] = useState(false);
  const [selectedArtistForChange, setSelectedArtistForChange] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showSampleBrowser, setShowSampleBrowser] = useState(false);
  const [currentSampleBook, setCurrentSampleBook] = useState('male');
  const [currentSampleBookPage, setCurrentSampleBookPage] = useState(0);
  const [sampleBookColor, setSampleBookColor] = useState('blue');
  const [paymentStatus, setPaymentStatus] = useState(null); // Track if user has paid
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  
  const fileInputRef = useRef(null);
  const codeInputRefs = useRef([]);

  // Homepage book preview slideshow - cycle through artists every 2 seconds
  useEffect(() => {
    const slideshowInterval = setInterval(() => {
      setHomepageArtistIndex((prev) => (prev + 1) % artistSlideshow.length);
    }, 2000); // Change image every 2 seconds

    return () => clearInterval(slideshowInterval);
  }, []);

  // Track page view on mount
  useEffect(() => {
    trackEvent('page_view');
  }, []);


  const colorOptions = [
    { name: 'blue', bg: 'bg-blue-500', label: 'Blue', cover: 'blue-cover.jpg' },
    { name: 'dark-green', bg: 'bg-emerald-800', label: 'Dark Green', cover: 'dark-green-cover.jpg' },
    { name: 'green', bg: 'bg-green-500', label: 'Green', cover: 'green-cover.jpg' },
    { name: 'orange', bg: 'bg-orange-500', label: 'Orange', cover: 'orange-cover.jpg' },
    { name: 'purple', bg: 'bg-purple-500', label: 'Purple', cover: 'purple-cover.jpg' }
  ];

  const artists = [
    { 
      name: 'Leonardo da Vinci', 
      period: 'Renaissance',
      malePrompt: 'Renaissance portrait characterized by masterful sfumato and divine serenity. Masculine figure in three-quarter view with solemn blessed expression, one hand raised with two fingers extended in gesture of benediction, the other hand holding crystalline orb. Refined noble features with contemplative gaze. Rich blue robes with intricate gold embroidery and red undergarment visible. Warm golden-brown atmospheric tones, luminous skin rendered with delicate glazing. Dark background with subtle gradations, imperceptible brushwork creating smooth transitions. Capturing spiritual authority and Renaissance ideals of human divinity through anatomical precision and psychological depth. Preserve original eyewear if present, do not add or remove glasses. Maintain original facial hair style exactly as it appears, do not add or remove facial hair. Maintain original hair length exactly as it appears.',
      femalePrompt: 'Renaissance portrait featuring a single feminine subject with soft delicate sfumato technique, subtle enigmatic smile with mysterious knowing expression. Warm golden-brown earth tones, hands delicately folded or crossed in contemplative pose. Misty atmospheric landscape background with winding paths and distant mountains, three-quarter view revealing elegant posture. Oil painting with imperceptibly smooth transitions and invisible brushstrokes, dark draped dress with fine pleating details. Veil or translucent head covering, luminous porcelain skin tones with delicate glazes. Contemplative timeless mood capturing inner grace, psychological depth, and sophisticated Renaissance femininity. Only one female figure present in composition. Preserve original eyewear if present, do not add or remove glasses. Maintain original hair length exactly as it appears.',
      malePetPrompt: 'Renaissance portrait of a pet characterized by masterful sfumato and divine serenity. Masculine pet figure in three-quarter view with solemn blessed expression. The pet\'s paw is raised with two digits extended in gesture of benediction, the other paw resting on a crystalline orb. Refined noble features with contemplative gaze. Rich blue robes with intricate gold embroidery are draped over the pet, with a red undergarment visible. Warm golden-brown atmospheric tones, luminous fur/scale/feather texture rendered with delicate glazing. Dark background with subtle gradations, imperceptible brushwork. Capturing spiritual authority and Renaissance ideals of human divinity through anatomical precision and psychological depth.',
      femalePetPrompt: 'Renaissance portrait of a pet featuring a single feminine pet subject with soft delicate sfumato technique, a subtle enigmatic smile/expression with mysterious knowing expression. Warm golden-brown earth tones, paws delicately folded or crossed in a contemplative pose. Misty atmospheric landscape background with winding paths and distant mountains, three-quarter view revealing elegant posture. The pet is adorned in a dark, finely pleated draped garment. A light veil or intricate head covering is worn by the pet, with luminous porcelain fur/scale/feather texture and delicate glazes. Contemplative timeless mood capturing inner grace, psychological depth, and sophisticated Renaissance femininity. Only one female pet figure present in composition.'
    },
    { 
      name: 'Michelangelo', 
      period: 'Renaissance',
      malePrompt: 'Create a full-body marble statue of the man from the original image, in a classical pose, located in a grand museum hall. The statue, including the head, should be made of white marble and faithfully retain his facial features, including his glasses if present, his beard/stubble, and his hairstyle. He should be adorned with simple, draped classical robes covering his lower body, leaving his chest and arms exposed. The lighting should evoke a serene museum atmosphere, highlighting the marble texture and form.',
      femalePrompt: 'Renaissance portrait with idealized feminine beauty in sacred monumental style, powerful graceful features with classical proportions and sculptural presence. Flowing robes and gathered drapery in rich earth tones of terracotta, deep azure blues, warm ochres, and sage greens. Surrounded by celestial elements - soft-winged cherubic putti, swirling heavenly clouds, painted architectural framework with coffered vaults. Seated or reclining pose with turned contrapposto torso, one arm extended in graceful gesture. Strong chiaroscuro creates dramatic divine illumination, expression blending tender maternal warmth with spiritual authority. Monumental fresco-like composition with vibrant colors and bold sculptural forms. Only one female figure present in composition. Preserve original eyewear if present, do not add or remove glasses. Maintain original hair length exactly as it appears.',
      malePetPrompt: 'Create a full-body white Carrara marble statue of the pet from the original image, in a powerful, dynamic classical pose (contrapposto), located in a grand museum hall. The statue should faithfully retain the pet\'s facial features and, if applicable, their glasses, beard/stubble, and fur/hair style. The musculature and form of the pet should be idealized and heroic, adorned with simple, draped classical robes covering the lower body/legs, leaving the chest and front paws exposed. The lighting should evoke a serene museum atmosphere, highlighting the marble\'s polished texture and powerful form.',
      femalePetPrompt: 'Create a full-body white Carrara marble statue of the pet from the original image, in an elegant, serene classical pose, located in a grand museum hall. The statue should faithfully retain the pet\'s facial features and, if applicable, their glasses and fur/hair style. The form is graceful and idealized, with flowing drapery and gathered robes carved in high relief, emphasizing delicate lines and movement, covering most of the body except the face and one elegant paw. The lighting should evoke a serene museum atmosphere, highlighting the marble\'s polished texture and gentle, flowing form.'
    },
    { 
      name: 'Raphael', 
      period: 'High Renaissance',
      malePrompt: 'High Renaissance portrait in the refined manner of Raphael\'s Portrait of Baldassare Castiglione, featuring balanced harmony and noble restraint. The subject\'s masculine features convey intelligence and calm confidence, framed by soft chiaroscuro and a luminous warm tone. The subject is wearing the elegant attire of a Renaissance courtier: a dark doublet with a trim of grey-brown squirrel fur, a bloused creamy-white shirt visible at the chest, and a black beret atop a simple turban-style cap. Subtle brushwork and a limited palette of blacks, creams, warm flesh tones, and muted greys create elegant simplicity. The figure sits in poised three-quarter view, radiating cultivated dignity and introspection, encapsulating Raphael\'s ideal of human grace and classical serenity.',
      femalePrompt: 'High Renaissance portrait with soft luminous feminine beauty and perfect classical proportions. Subject in elegant three-quarter pose wearing sumptuous Renaissance gown with puffed sleeves, rich fabrics of silk and velvet in warm earth tones. Delicate jewelry - pearl necklace, rings, or ornate headdress with translucent veil. One hand delicately positioned near chest or holding small object, displaying graceful fingers. Serene expression with gentle direct gaze, porcelain skin with warm rosy undertones. Balanced harmonious composition with architectural elements or soft landscape background. Refined invisible brushwork, luminous glazing technique, capturing idealized feminine virtue, dignity, and timeless Renaissance elegance. Only one female figure present in composition. Preserve original eyewear if present, do not add or remove glasses. Maintain original hair length exactly as it appears.',
      malePetPrompt: 'High Renaissance portrait of a pet in the refined manner of Raphael\'s Portrait of Baldassare Castiglione, featuring balanced harmony and noble restraint. The masculine pet\'s features convey intelligence and calm confidence, framed by soft chiaroscuro and a luminous warm tone. The pet is wearing the elegant attire of a Renaissance courtier: a dark doublet with a trim of grey-brown squirrel fur, a bloused creamy-white shirt visible at the chest, and a black beret atop a simple turban-style cap. Subtle brushwork and a limited palette create elegant simplicity. The pet sits in poised three-quarter view, radiating cultivated dignity and introspection. Preserve original eyewear if present, do not add or remove glasses.',
      femalePetPrompt: 'High Renaissance portrait of a pet with soft luminous feminine beauty and perfect classical proportions. Subject in elegant three-quarter pose wearing sumptuous Renaissance gown with puffed sleeves, rich fabrics of silk and velvet in warm earth tones. Delicate jewelry—pearl necklace, rings, or ornate headdress with translucent veil—is worn by the pet. One paw delicately positioned near the chest or holding a small object, displaying graceful digits. Serene expression with gentle direct gaze, porcelain fur/scale/feather texture with warm rosy undertones. Balanced harmonious composition with architectural elements or soft landscape background.'
    },
    { 
      name: 'Rembrandt', 
      period: 'Baroque',
      malePrompt: 'Baroque portrait depicting mastery of light and introspection with dramatic chiaroscuro. The masculine figure wears rich period costume - velvet cap or beret, fur-trimmed robes, ornate gold chain across chest. Emerging from deep shadow, bathed in warm amber and golden tones from single light source. Thick impasto brushwork and layered glazes reveal every crease and contour, weathered hands visible holding painter\'s tools or resting contemplatively. Dark velvety backdrop emphasizes the illuminated face and costume details, capturing profound psychological depth, wisdom, and life experience through masterful play of light and shadow. Preserve original eyewear if present, do not add or remove glasses. Maintain original facial hair style exactly as it appears, do not add or remove facial hair.',
      femalePrompt: 'Baroque portrait with soft feminine features illuminated by warm golden light from single window source. Subject adorned in sumptuous fabrics - rich brocade dress, fur trim, pearl necklaces and jewelry catching the light. Tender gaze with gentle introspective expression, perhaps holding flowers or wearing elaborate headdress with feathers. Rich jewel tones of deep crimson, amber gold, and warm browns create intimate atmosphere. Soft shadows with luminous highlights on silk and velvet textures, layered oil painting technique with subtle glazing. Luxurious period costume details emerge from darkness, conveying warmth, domestic intimacy, and graceful humanity. Only one female figure present in composition. Preserve original eyewear if present, do not add or remove glasses. Maintain original hair length exactly as it appears.',
      malePetPrompt: 'Baroque portrait of a pet depicting mastery of light and introspection with dramatic chiaroscuro. The masculine pet figure wears rich period costume—velvet cap or beret, fur-trimmed robes, ornate gold chain across the chest. Emerging from deep shadow, bathed in warm amber and golden tones from a single light source. Thick impasto brushwork and layered glazes reveal every crease and contour, weathered paws visible resting contemplatively. Dark velvety backdrop emphasizes the illuminated face and costume details, capturing profound psychological depth, wisdom, and life experience.',
      femalePetPrompt: 'Baroque portrait of a pet with soft feminine features illuminated by warm golden light from a single window source. Subject adorned in sumptuous fabrics—rich brocade dress, fur trim, pearl necklaces and jewelry catching the light. Tender gaze with gentle introspective expression, perhaps holding a small flower or wearing an elaborate headdress with feathers. Rich jewel tones of deep crimson, amber gold, and warm browns create an intimate atmosphere. Soft shadows with luminous highlights on silk and velvet textures. Luxurious pet period costume details emerge from darkness, conveying warmth, domestic intimacy, and graceful humanity. Only one female pet figure present in composition.'
    },
    { 
      name: 'Johannes Vermeer', 
      period: 'Dutch Golden Age',
      malePrompt: 'Dutch Golden Age portrait of a single masculine subject combining luminous domestic light with contemplative atmosphere. The man, rendered with crystalline precision, sits alone near a window bathed in soft daylight that spills across rich fabrics and wooden textures. Wearing period gentleman\'s attire with white collar and dark jacket. Refined brushwork, harmonious composition, and pearl-like highlights create serenity within an intimate interior. The scene conveys both stillness and quiet narrative tension, embodying mastery of light, texture, and psychological nuance. Only one male figure present in the composition. Preserve original eyewear if present, do not add or remove glasses. Maintain original facial hair style exactly as it appears, do not add or remove facial hair.',
      femalePrompt: 'Dutch Golden Age portrait of a single feminine subject, a close-up three-quarter view with a gentle expression and direct gaze, wearing a simple yellow and blue turban and a large pearl earring. The background is a flat, very dark, indeterminate tone. The light is diffused, coming from the upper left, highlighting the porcelain skin and the textures of the fabric. The overall style embodies the pearl-like luminosity, refined invisible brushwork, and psychological intimacy of Johannes Vermeer\'s \'Girl with a Pearl Earring\'. Only one female figure present in the composition. Preserve original eyewear if present, do not add or remove glasses. Maintain original hair length exactly as it appears.',
      malePetPrompt: 'Dutch Golden Age portrait of a single masculine pet subject combining luminous domestic light with a contemplative atmosphere. The pet, rendered with crystalline precision, sits alone near a window bathed in soft daylight that spills across rich fabrics and wooden textures. Wearing period gentleman\'s attire with a white collar and dark jacket. Refined brushwork, harmonious composition, serenity within an intimate interior. The scene conveys both stillness and quiet narrative tension, embodying mastery of light, texture, and psychological nuance. Only one male pet figure present in the composition.',
      femalePetPrompt: 'Dutch Golden Age portrait of a single feminine pet subject, a close-up three-quarter view with a gentle expression and direct gaze, wearing a simple yellow and blue turban and a large pearl earring. The background is a flat, very dark, indeterminate tone. The light is diffused, coming from the upper left, highlighting the porcelain fur/scale/feather texture and the textures of the fabric. The overall style embodies the pearl-like luminosity, refined invisible brushwork, and psychological intimacy of Johannes Vermeer\'s \'Girl with a Pearl Earring\'.'
    },
    { 
      name: 'Claude Monet', 
      period: 'Impressionism',
      malePrompt: 'Impressionist portrait set against vibrant seaside light and coastal gardens. The masculine figure is captured in natural sunlight with flickering brushstrokes and broken color. Loose painterly marks merge blues, ochres, and greens into shimmering atmospheric unity. The background evokes an airy coastal breeze and luminous sky, blending figure and nature in a symphony of color and movement, full of spontaneity and plein-air vitality. Preserve original eyewear if present, do not add or remove glasses. Maintain original facial hair style exactly as it appears, do not add or remove facial hair.',
      femalePrompt: 'Impressionist portrait with soft feminine features captured in natural sunlight, loose delicate brushstrokes, vibrant impressionistic colors with pinks, purples, and yellows, light filtering through fabric or flowers, outdoor garden or water lilies background, atmospheric dreamy effect, fleeting moment captured in motion, airy and light-filled composition, impressionistic spontaneity, emphasizing feminine grace in nature. Only one female figure present in composition. Preserve original eyewear if present, do not add or remove glasses. Maintain original hair length exactly as it appears.',
      malePetPrompt: 'Impressionist portrait of a pet set against vibrant seaside light and coastal gardens. The masculine pet figure is captured in natural sunlight with flickering brushstrokes and broken color. Loose painterly marks merge blues, ochres, and greens into shimmering atmospheric unity. The background evokes an airy coastal breeze and luminous sky, blending the pet figure and nature in a symphony of color and movement, full of spontaneity and plein-air vitality.',
      femalePetPrompt: 'Impressionist portrait of a pet with soft feminine features captured in natural sunlight, loose delicate brushstrokes, vibrant impressionistic colors with pinks, purples, and yellows, light filtering through fabric or flowers. Outdoor garden or water lilies background, atmospheric dreamy effect, fleeting moment captured in motion, airy and light-filled composition, impressionistic spontaneity, emphasizing feminine grace in nature. Only one female pet figure present in composition.'
    },
    { 
      name: 'Vincent van Gogh', 
      period: 'Post-Impressionism',
      malePrompt: 'Post-Impressionist portrait in the intense style of Vincent van Gogh, inspired by his male self-portraits from 1889, thick impasto brushstrokes with three-dimensional texture, masculine features with strong character, intense penetrating gaze with psychological depth, swirling energetic movement in background, vibrant color palette with cobalt blues, chrome yellows, and emerald greens, visible heavy paint application, expressive gestural brushwork, raw emotional intensity, textured surface with thick pigment, radiating energy lines, characteristic Van Gogh turbulent style, Starry Night background. Preserve original eyewear if present, do not add or remove glasses. Maintain original hair length exactly as it appears. Make sure that the people are not painted blue but are skin tones that Picasso would use',
      femalePrompt: 'Post-Impressionist portrait with soft feminine features and emotional depth, thick impasto brushstrokes with heavily textured surface. Swirling Starry Night background with characteristic spiral patterns in deep blues and vibrant yellows, crescent moon and radiating stars in circular swirling motions, night sky with cypress silhouettes or village elements in distance. Vibrant colors of warm peaches in facial tones contrasting with cosmic blues and golden yellows, intense yet tender expression. Visible energetic paint application with distinctive circular brushwork patterns, capturing inner emotion and feminine warmth within celestial setting, expressive and lively composition with iconic swirling night sky energy. Only one female figure present in composition. Preserve original eyewear if present, do not add or remove glasses. Maintain original hair length exactly as it appears. Make sure that the people are not painted blue, use skin tones that Picasso would use.',
      malePetPrompt: 'Post-Impressionist portrait of a pet in the intense style of Vincent van Gogh, inspired by his male self-portraits from 1889, thick impasto brushstrokes with three-dimensional texture. Masculine pet features with strong character, intense penetrating gaze with psychological depth, swirling energetic movement in background, vibrant color palette with cobalt blues, chrome yellows, and emerald greens, visible heavy paint application, expressive gestural brushwork, raw emotional intensity, Starry Night background.',
      femalePetPrompt: 'Post-Impressionist portrait of a pet with soft feminine features and emotional depth, thick impasto brushstrokes with heavily textured surface. Swirling Starry Night background with characteristic spiral patterns in deep blues and vibrant yellows, crescent moon and radiating stars in circular swirling motions. Vibrant colors of warm peaches in facial tones contrasting with cosmic blues and golden yellows, intense yet tender expression. Visible energetic paint application with distinctive circular brushwork patterns, capturing inner emotion and feminine warmth within a celestial setting. Only one female pet figure is present in composition.'
    },
    { 
      name: 'Edvard Munch', 
      period: 'Expressionism',
      malePrompt: 'Transform the subject into a ghostly, elongated, whispy creature in the style of Edvard Munch\'s The Scream, as if drawn roughly with crayons or pastels by a child. Completely replace the expression with a dramatically warped, wide-open, anguished scream, stretching the mouth downward and blending it into the surrounding face. Pose the figure with both hands holding the sides of the head, in the classic Scream posture. The figure\'s body and face are distorted, flowing, and melting into the scene, while preserving the subject\'s eyewear and clothing cues. Keep the original Munch setting fully intact: the bridge, railing, horizon, and swirling turbulent sky of crimson, orange, ochre, cobalt, and indigo, rendered in the same naive, scratchy, crayon-like style. No cartoon, no photorealism — the figure is messy, expressive, and emotionally distorted, dissolving naturally into the iconic background.',
      femalePrompt: 'Expressionist portrait in illustrated caricature style with exaggerated emotional distortion. The female figure\'s face rendered with simplified bold lines, elongated oval head shape, hands raised to sides of face in gesture of existential dread. Mouth open in silent expression of anguish, eyes wide with psychological terror. Fluid wavy brushstrokes throughout, swirling sky background of vivid crimson, burnt orange, and deep indigo streaks. Bridge or railing setting with diagonal perspective lines. Stylized almost cartoon-like simplification while maintaining raw emotional power. Bold unnatural colors, warped flowing forms, gestural visible brushwork. The composition captures primal fear and vulnerability through graphic symbolic intensity and expressive distortion. Preserve original eyewear if present, do not add or remove glasses. Maintain original hair length exactly as it appears.',
      malePetPrompt: 'Expressionist portrait of a pet in illustrated caricature style with highly abstract and distorted features, reminiscent of Munch\'s *The Scream*. The male pet figure\'s face rendered with minimal, raw, simplified bold lines, lacking fine definition and left to psychological interpretation. Elongated pet head shape, paws raised to sides of face in a gesture of existential dread. Mouth open in a silent expression of anguish, eyes wide with highly generalized, abstract psychological terror. Fluid wavy brushstrokes throughout, swirling sky background of vivid crimson, burnt orange, and deep indigo streaks. Stylized almost cartoon-like simplification while maintaining raw emotional power.',
      femalePetPrompt: 'Expressionist portrait of a pet in illustrated caricature style with exaggerated emotional distortion. The female pet figure\'s face rendered with simplified bold lines, elongated pet head shape, paws raised to sides of face in a gesture of existential dread. Mouth open in a silent expression of anguish, eyes wide with psychological terror. Fluid wavy brushstrokes throughout, swirling sky background of vivid crimson, burnt orange, and deep indigo streaks. Stylized almost cartoon-like simplification while maintaining raw emotional power. The composition captures primal fear and feminine vulnerability through graphic symbolic intensity and expressive distortion.'
    },
    { 
      name: 'Cubism', 
      period: 'Cubism/Surrealism',
      malePrompt: 'Style: Cubism • Neon Vibrant • Geometric • Abstract Masculine Expressionism\nMain Instruction:\n Create a Cubist portrait of the male subject, placed within a fragmented geometric Cubist background. The subject is rendered in Cubist style while remaining the clear focal point, surrounded by angular abstract planes.\nSubject Rules:\nOne single, unified male subject only.\n\n\nDo not duplicate, split, or multiply the face.\n\n\nKeep original eyewear exactly as it appears (do not add/remove/change glasses).\n\n\nMaintain original hair length, beard, or facial hair exactly as shown in the source image.\n\n\nVisual Style – Subject:\nStrong masculine features broken into geometric facets and angular planes.\n\n\nOverlapping shapes, analytical Cubist structure, subtle multi-viewpoint hints.\n\n\nNeon palette on the subject: electric blue, hot pink, bright yellow, vivid orange, deep purple, lime green.\n\n\nFlattened, high-contrast color blocks, each plane in its own saturated neon tone.\n\n\nVisual Style – Background:\nFully abstract fragmented Cubist environment behind the subject.\n\n\nIrregular shapes, intersecting planes, neon geometric patterns.\n\n\nNo photorealism; the background should be entirely Cubist.\n\n\nBackground complements but does not overpower the subject.\n\n\nMood & Composition:\nStrong angular rhythm, geometric dynamism.\n\n\nExplosive neon color harmony with a bold masculine edge.\n\n\nWell-balanced abstraction that preserves identity.\n\n\nOutput:\n A neon Cubist portrait of a single male subject, surrounded by a fragmented Cubist background, preserving glasses (if any) and exact hair/facial hair length.\n',
      femalePrompt: 'Style: Cubism • Neon Vibrant • Geometric • Abstract Feminine Expressionism\nMain Instruction:\n Create a Cubist portrait of the subject, placed within a fragmented, geometric Cubist background. The subject is rendered in Cubist style but remains the main focus, surrounded by angular, abstract planes in the background.\nSubject Rules:\nOne single, unified subject only.\n\n\nDo not duplicate or multiply the face.\n\n\nKeep original eyewear exactly as it appears (do not add/remove/change glasses).\n\n\nMaintain original hair length exactly.\n\n\nVisual Style – Subject:\nFeminine features fragmented into angular facets and geometric planes.\n\n\nOverlapping shapes, multiple subtle viewpoints, analytical Cubist structure.\n\n\nBright neon palette on the subject: electric blue, hot pink, bright yellow, vivid orange, deep purple, lime green.\n\n\nFlattened, high-contrast color blocks, each plane in a distinct vibrant tone.\n\n\nVisual Style – Background:\nFully abstract, fragmented geometric Cubist background.\n\n\nNo photorealism.\n\n\nDynamic planes, intersecting shapes, and neon-saturated color patterns.\n\n\nBackground complements but does not overpower the subject.\n\n\nMood & Composition:\nRhythmic geometric architecture.\n\n\nExplosive neon color harmony.\n\n\nStrong contrast between subject and background while keeping a cohesive Cubist identity.\n\n\nOutput:\n A neon Cubist portrait of a single female subject, surrounded by a fragmented Cubist background, with preserved glasses and exact hair length.',
      malePetPrompt: 'Cubist/Surrealist portrait of a pet in the style of Picasso, **highly abstract and fragmented** with simultaneous viewpoints. The masculine pet figure is completely reimagined through a shattered arrangement of **hard-edged, geometric, intersecting planes** (like squares, triangles, and cones), showing **multiple pet facial angles at once** (e.g., a profile eye on a frontal face). The figure\'s composition should be **highly abstract, pushing away from recognizable form**. **Picasso\'s signature vibrant palette** is used: **Vibrant Reds, Bright Yellows, Turquoise, Purples, Lilacs, and Bright Greens**. The composition features **heavy, black outlines (cloisonné)** and **large, flat areas of color** with sharp, high-contrast, non-naturalistic hues. The final image must embody **analytical and synthetic cubism** through extreme geometric distortion and non-realistic, fragmented representation.',
      femalePetPrompt: 'Cubist/Surrealist portrait of a pet in the style of Picasso, **highly abstract and fragmented** with simultaneous viewpoints. The feminine pet figure is completely reimagined through a shattered arrangement of **hard-edged, geometric, intersecting planes** (like squares, triangles, and cones), showing **multiple pet facial angles at once** (e.g., a profile eye on a frontal face). The figure\'s composition should be **highly abstract, pushing away from recognizable form**. **Picasso\'s signature vibrant palette** is used: **Vibrant Reds, Bright Yellows, Turquoise, Purples, Lilacs, and Bright Greens**. The composition features **heavy, black outlines (cloisonné)** and **large, flat areas of color** with sharp, high-contrast, non-naturalistic hues. The final image must embody **analytical and synthetic cubism** through extreme geometric distortion and non-realistic, fragmented representation.'
    },
    { 
      name: 'Surrealism', 
      period: 'Surrealism',
      malePrompt: 'Create a Salvador Dalí–inspired surrealist portrait of one single male subject in a vast golden desert. Preserve his face, identity, hairstyle length, facial hair, and body proportions so he remains fully human and recognizable. Do not create drawers, crutches, or any body openings.\n\nShift the style away from photorealism and toward Dalí\'s painterly oil technique: visible brush textures, softened contours, slightly exaggerated forms, warm surreal lighting, and a dreamlike golden palette. He should appear as a painted Dalí character rather than a superimposed photograph.\n\nHe is gently holding a melting pocket watch in one hand, the curved clock draping over his palm in classic Dalí style.\n\nAllow elegant surreal transitions. The entire bottom half of his body may transform into desert forms such as flowing sand, cracked earth, or root-like structures rising from the ground. This transition should remain organic, poetic, and non-monstrous. His hair may blend subtly into drifting clouds, wind, or soft painterly strokes. His clothing may partially dissolve into sand, mist, or flowing desert textures.\n\nPlace him within a Dalí desert dreamscape: barren skeletal trees with melting clocks, long thin shadows stretching across cracked desert ground, floating spheres, drifting sand particles, distant elephants walking on stilt-like legs, and a soft atmospheric haze. Maintain a clean composition emphasizing symbolism, painterly surrealism, and elegant transformation rather than realism.',
      femalePrompt: 'Create a Salvador Dalí–inspired surrealist portrait of one single female subject in a vast golden desert. Preserve her face, identity, hairstyle length, and natural body proportions. She must remain fully human and recognizable. Do not create drawers, crutches, or any openings in the body.\n\nShift the style away from photorealism and toward Dalí\'s painterly, slightly exaggerated oil-painting aesthetic. Use visible brush textures, soft edges, warm surreal lighting, and a dreamlike golden palette. She should look like a painted surrealist character, not like a composited photograph.\n\nShe gently holds a melting pocket watch in one hand, the clock draped over her palm in classic Dalí style, with flowing curves and softened forms.\n\nAllow elegant, more pronounced surreal transitions:\n\n• The entire bottom half of her body (from waist downward) gradually transforms into a blend of sand, cracked desert earth, and organic root-like structures, as if she is growing from or merging with the ground\n• Her hair softly transitions into drifting cloud wisps, wind, or painterly strokes\n• Her clothing may partially dissolve into sand, mist, or fluid brush-texture fabrics, while still keeping its basic form recognizable\n\nSurround her with Dalí dreamscape elements:\n• Barren skeletal trees draped with melting clocks\n• Long, thin, impossible shadows stretching across cracked earth\n• Floating spheres and drifting sand motes suspended in the air\n• Distant elephants on elongated stilt-like legs\n• Soft atmospheric haze and calm dream logic throughout\n\nMaintain a clean composition emphasizing beauty, painterly character design, symbolic elements, and surreal transformation. Prioritize Dalí-style brushwork and stylization over realism, ensuring she feels like a surreal painted figure emerging from the desert, not a photo.',
      malePetPrompt: 'Create a Salvador Dalí–inspired surrealist portrait of one single male dog standing in a vast golden desert. Preserve the dog\'s exact facial features, breed proportions, natural coloring, and any clothing he is wearing, such as a sweater. Do not add bows, accessories, or gender-altering elements. The dog must remain fully recognizable and natural, not humanized.\n\nShift the style away from photorealism and toward Dalí\'s painterly surrealism, with visible brush textures, warm dreamlike lighting, softened edges, and exaggerated oil-painting character.\n\nHave the dog gently interacting with a melting pocket watch in classic Dalí style: the soft clock may drape over a rock, his paw, or the sand near him, with subtle playful or curious interaction.\n\nInclude a surreal cloud formation in the sky that loosely resembles the silhouette of the dog\'s breed, but keep it clearly a cloud — soft, abstract, airy, with no hard outlines or photographic detail. The resemblance should be subtle and impressionistic, not literal.\n\nSurround the scene with Dalí dreamscape elements:\n\n• Barren skeletal trees with melting clocks\n• Long thin shadows across cracked desert ground\n• Floating spheres or drifting sand particles\n• Distant elephants on stilt-like legs\n• Soft atmospheric haze\n\nMaintain a calm, symbolic, painterly composition that emphasizes surrealism, desert emptiness, and a dreamlike connection between the dog, the melting clock, and the cloud resemblance.',
      femalePetPrompt: 'Create a Salvador Dalí–inspired surrealist portrait of one single female pet standing in a vast golden desert. Preserve the pet\'s identity, facial structure, fur pattern, and any clothing she is wearing in the original photo. She must remain fully recognizable and natural, without drawers, crutches, or unnatural body openings.\n\nShift the style away from photorealism toward Dalí\'s classic painterly oil-painting look: softened edges, visible brush textures, warm surreal lighting, and a dreamlike color palette.\n\nThe pet gently interacts with a melting pocket watch draped over a rock, branch, or object near her, in the classic Dalí style of flowing, softened clocks.\n\nAdd elegant surreal elements around her:\n• A drifting cloud above her that is abstract and painterly, subtly alluding to the pet\'s general shape or breed silhouette without becoming a literal dog image. The cloud must remain unmistakably a cloud, soft, airy, and surreal rather than a cut-out figure.\n• Long thin shadows across cracked golden desert earth\n• Occasional floating spheres or drifting sand\n• Barren skeletal trees in the distance with melting clocks\n• Optional tiny elephants walking on long stilt-like legs\n• Soft atmospheric haze and calm dreamlike space\n\nMaintain a clean, balanced composition emphasizing beauty, symbolism, and painterly surreal transformation. The pet should feel like a Dalí-inspired character within an impossible dreamscape, not a photorealistic cutout.'
    },
    { 
      name: 'Pop Art', 
      period: 'Pop Art',
      malePrompt: 'Pop Art portrait in iconic 2x2 grid format with four color variations of the same face. High contrast silkscreen aesthetic with simplified bold features - strong jawline, defined nose, expressive eyes reduced to graphic shapes. Each quadrant features different vibrant color combination: top-left with neon pink face on yellow background, top-right with neon green face on blue background, bottom-left with neon yellow face on pink background, bottom-right with neon blue face on green background. Flat planes of solid color, heavy black outlines and shadows, mechanical screen-print texture. The repeated image in saturated artificial colors transforms identity into pop icon, mass-produced celebrity aesthetic with commercial vibrancy and graphic clarity. Preserve original eyewear if present, do not add or remove glasses. Maintain original facial hair style exactly as it appears, do not add or remove facial hair.',
      femalePrompt: 'Pop Art portrait in iconic 2x2 grid format with four color variations of the same face. High contrast silkscreen aesthetic with simplified glamorous features - defined eyes, bold lips, elegant curves reduced to graphic shapes. Each quadrant features different vibrant color combination: top-left with hot pink face on yellow background, top-right with electric blue face on orange background, bottom-left with bright yellow face on magenta background, bottom-right with lime green face on purple background. Flat planes of solid color, heavy black outlines and shadows, mechanical screen-print texture. The repeated feminine image in saturated artificial colors creates mass-produced celebrity glamour with commercial pop iconography and poster-like graphic clarity. Only one female figure present in composition. Preserve original eyewear if present, do not add or remove glasses. Maintain original hair length exactly as it appears.',
      malePetPrompt: 'Pop Art portrait of a pet in iconic 2x2 grid format with four color variations of the same face. High contrast silkscreen aesthetic with simplified bold features—defined nose, expressive eyes reduced to graphic shapes. Each quadrant features a different vibrant color combination: top-left with neon pink face on yellow background, top-right with neon green face on blue background, bottom-left with neon yellow face on pink background, bottom-right with neon blue face on green background. Flat planes of solid color, heavy black outlines and shadows, mechanical screen-print texture. The repeated image in saturated artificial colors transforms the pet identity into a pop icon, mass-produced celebrity aesthetic with commercial vibrancy and graphic clarity.',
      femalePetPrompt: 'Pop Art portrait of a pet in iconic 2x2 grid format with four color variations of the same face. High contrast silkscreen aesthetic with simplified glamorous features—defined eyes, bold lips, elegant curves reduced to graphic shapes. Each quadrant features a different vibrant color combination: top-left with hot pink face on yellow background, top-right with electric blue face on orange background, bottom-left with bright yellow face on magenta background, bottom-right with lime green face on purple background. Flat planes of solid color, heavy black outlines and shadows, mechanical screen-print texture. The repeated feminine pet image in saturated artificial colors creates mass-produced celebrity glamour with commercial pop iconography and poster-like graphic clarity.'
    },
    { 
      name: 'Grant Wood', 
      period: 'American Regionalism',
      malePrompt: 'American Regionalist portrait of a stern-faced man in the style of Grant Wood. The man is the ONLY human figure in the composition, standing in front of a white clapboard house with a Gothic window. He wears a dark jacket with white collarless shirt and round wire spectacles, holding a three-pronged pitchfork vertically. Transform the uploaded male subject into this composition with his exact facial features, bone structure, and distinctive characteristics clearly recognizable. Render him with resolute stoic posture, plain dignity, gazing directly forward with serious expression. Use crisp lines and smooth enamel-like texture with precise stylized features. Earthy browns, greens, and muted blues evoke rural Midwestern setting. Folk art influence with clean linear forms. The subject face, eyes, nose, mouth, and overall likeness must be clearly identifiable as the uploaded person. Preserve original eyewear if present. Maintain original facial hair exactly as it appears.',
      femalePrompt: 'American Regionalist portrait of a woman in the style of Grant Wood. The woman is the ONLY human figure in the composition, standing in front of a white clapboard house with a Gothic window. She wears a modest period dress with white rickrack trim, white collar, and cameo brooch at neck, hair pulled back in severe center part. Transform the uploaded female subject into this composition with her exact facial features, bone structure, and distinctive characteristics clearly recognizable. Render her with precise stylized features, strong Midwestern character with gentle restrained dignity, modest serious expression. Use crisp lines and smooth enamel-like finish with precise folk art style. Warm earth tones with soft pastels, clean linear forms. The subject face, eyes, nose, mouth, and overall likeness must be clearly identifiable as the uploaded person. Preserve original eyewear if present. Maintain original hair length exactly as it appears.',
      malePetPrompt: 'American Regionalist portrait in two-figure composition featuring a stern-faced male pet and a modest human woman standing together in front of a white clapboard house with a Gothic window. Transform the male pet subject into the farmer figure in the foreground—wearing a dark structured jacket with a white collarless shirt, round wire spectacles, and holding a three-pronged pitchfork vertically in one paw. The male pet is rendered with a resolute stoic posture and plain dignity, gazing directly forward with a serious expression. A modest human woman remains in the background (wearing a period dress with a white collar), standing slightly behind. Rendered in crisp lines and smooth enamel texture with precise stylized features, conveying rural Midwestern honesty.',
      femalePetPrompt: 'American Regionalist portrait in two-figure composition featuring a human male and a female pet standing together in front of a white clapboard house with a Gothic window. Transform the female pet subject into the woman figure—wearing a modest period dress with white rickrack trim, a white collar, and a cameo brooch at the neck. The female pet is rendered with precise stylized features, strong Midwestern character with gentle restrained dignity, a modest serious expression, standing slightly behind or beside the human male. The human male remains in the foreground (stern farmer in a dark jacket, holding a three-pronged pitchfork). Rendered in crisp lines and smooth enamel-like finish with a precise folk art style. The female pet should clearly become the modest woman pet in period dress.'
    }
  ];

  // Map artist names to simplified filenames for samples
  const artistFilenames = {
    'Leonardo da Vinci': 'davinci',
    'Michelangelo': 'michelangelo',
    'Raphael': 'raphael',
    'Rembrandt': 'rembrandt',
    'Johannes Vermeer': 'vermeer',
    'Claude Monet': 'monet',
    'Vincent van Gogh': 'vangogh',
    'Edvard Munch': 'munch',
    'Cubism': 'picasso',
    'Surrealism': 'dali',
    'Pop Art': 'warhol',
    'Grant Wood': 'grantwood'
  };

  // Sample images for preview mode (to be replaced with user's actual generated image for Van Gogh)
  const sampleImages = {
    male: {
      0: '/samples/male/davinci.jpg',
      1: '/samples/male/michelangelo.jpg',
      2: '/samples/male/raphael.jpg',
      3: '/samples/male/rembrandt.jpg',
      4: '/samples/male/vermeer.jpg',
      5: '/samples/male/monet.jpg',
      6: '/samples/male/vangogh.jpg', // Will be replaced with real image
      7: '/samples/male/munch.jpg',
      8: '/samples/male/picasso.jpg',
      9: '/samples/male/dali.jpg',
      10: '/samples/male/warhol.jpg',
      11: '/samples/male/grantwood.jpg'
    },
    female: {
      0: '/samples/female/davinci.jpg',
      1: '/samples/female/michelangelo.jpg',
      2: '/samples/female/raphael.jpg',
      3: '/samples/female/rembrandt.jpg',
      4: '/samples/female/vermeer.jpg',
      5: '/samples/female/monet.jpg',
      6: '/samples/female/vangogh.jpg',
      7: '/samples/female/munch.jpg',
      8: '/samples/female/picasso.jpg',
      9: '/samples/female/dali.jpg',
      10: '/samples/female/warhol.jpg',
      11: '/samples/female/grantwood.jpg'
    },
    pet: {
      0: '/samples/pet/davinci.jpg',
      1: '/samples/pet/michelangelo.jpg',
      2: '/samples/pet/raphael.jpg',
      3: '/samples/pet/rembrandt.jpg',
      4: '/samples/pet/vermeer.jpg',
      5: '/samples/pet/monet.jpg',
      6: '/samples/pet/vangogh.jpg',
      7: '/samples/pet/munch.jpg',
      8: '/samples/pet/picasso.jpg',
      9: '/samples/pet/dali.jpg',
      10: '/samples/pet/warhol.jpg',
      11: '/samples/pet/grantwood.jpg'
    },
    'pet-female': {
      0: '/samples/pet-female/davinci.jpg',
      1: '/samples/pet-female/michelangelo.jpg',
      2: '/samples/pet-female/raphael.jpg',
      3: '/samples/pet-female/rembrandt.jpg',
      4: '/samples/pet-female/vermeer.jpg',
      5: '/samples/pet-female/monet.jpg',
      6: '/samples/pet-female/vangogh.jpg',
      7: '/samples/pet-female/munch.jpg',
      8: '/samples/pet-female/picasso.jpg',
      9: '/samples/pet-female/dali.jpg',
      10: '/samples/pet-female/warhol.jpg',
      11: '/samples/pet-female/grantwood.jpg'
    }
  };

  // ============================================================================
  // HANDLER FUNCTIONS AND EFFECTS
  // ============================================================================

  useEffect(() => {
    const loadSessionFromUrl = async () => {
      const path = window.location.pathname;
      const urlParams = new URLSearchParams(window.location.search);
      
      const stripeSessionId = urlParams.get('session_id');
      if (stripeSessionId) {
        console.log('✅ Stripe redirect detected! Session ID:', stripeSessionId);
        
        const sessionMatch = path.match(/\/session\/([^\/\?]+)/);
        if (sessionMatch) {
          const ourSessionId = sessionMatch[1];
          setSessionId(ourSessionId);
          console.log('✅ Our session ID:', ourSessionId);
          
          // Load session data (with cache-busting to ensure fresh data)
          const cacheBust = Date.now();
          const sessionResponse = await fetch(`${BACKEND_URL}/api/session/${ourSessionId}?t=${cacheBust}`);
          const sessionData = await sessionResponse.json();
          
          console.log('📊 Fresh session data loaded:', {
            fulfillment_status: sessionData.fulfillment_status,
            lulu_print_job_id: sessionData.lulu_print_job_id,
            payment_status: sessionData.payment_status
          });
          
          // Set all session data
          setSelectedGender(sessionData.selected_gender);
          setUploadedImage(sessionData.uploaded_image);
          setCoverColor(sessionData.cover_color || 'blue');
          setCustomerName(sessionData.customer_name || '');
          setDedication(sessionData.dedication || '');
          setPaymentStatus(sessionData.payment_status); // 'paid'
          
          // Check if images are ready (webhook should have generated them)
          // OR if we're coming back from old batch generation endpoint
          console.log('🔍 Session data:', {
            fulfillment_status: sessionData.fulfillment_status,
            has_generated_images: !!sessionData.generated_images,
            generated_images_type: typeof sessionData.generated_images,
            is_preview_mode: sessionData.is_preview_mode
          });
          
          const hasImages = sessionData.generated_images && 
                           (typeof sessionData.generated_images === 'string' 
                             ? JSON.parse(sessionData.generated_images)
                             : sessionData.generated_images);
          const imageCount = hasImages ? Object.keys(hasImages).length : 0;
          
          console.log('🔍 Parsed images:', {
            imageCount,
            imageKeys: hasImages ? Object.keys(hasImages) : []
          });
          
          // Load images if we have at least 11 (all except Van Gogh) OR if not in preview mode anymore
          if ((imageCount >= 11 || !sessionData.is_preview_mode) && hasImages && imageCount > 0) {
            console.log(`✅ ${imageCount} images ready! Loading post-payment preview...`);
            
            // Safe parse - might already be object
            const allImages = typeof sessionData.generated_images === 'string'
              ? JSON.parse(sessionData.generated_images)
              : sessionData.generated_images || {};
            const allSelected = typeof sessionData.selected_images === 'string'
              ? JSON.parse(sessionData.selected_images)
              : sessionData.selected_images || {};
            
            console.log('🎨 All images:', Object.keys(allImages));
            console.log('🎨 All selected:', Object.keys(allSelected));
            
            // If selected_images is empty, auto-select first of each
            if (Object.keys(allSelected).length === 0) {
              Object.keys(allImages).forEach(idx => {
                // allImages[idx] is an array of images, select the first one
                allSelected[idx] = Array.isArray(allImages[idx]) 
                  ? allImages[idx][0] 
                  : allImages[idx];
              });
            }
            
            setGeneratedImages(allImages);
            setSelectedVariations(allSelected);
            setIsPreviewMode(false); // All real images now!
            console.log('🎨 Set isPreviewMode to FALSE - showing all real images');
            
            // DEBUG: Check fulfillment status
            console.log('🔍 DEBUG fulfillment_status:', sessionData.fulfillment_status);
            console.log('🔍 DEBUG lulu_print_job_id:', sessionData.lulu_print_job_id);
            
            // Check if order already placed - show success page instead of preview
            if (sessionData.fulfillment_status === 'order_placed' || sessionData.lulu_print_job_id) {
              console.log('✅ Order already placed! Showing success page');
              setOrderNumber(sessionData.lulu_print_job_id);
              setCurrentStep('success');
            } else {
              console.log('⏸️  Order not placed yet - showing preview for customer review');
              setCurrentStep('preview');
            }
          } else {
            // Images still generating via webhook - show loading
            setCurrentStep('generating-final');
            
            // Initialize progress
            let pollCount = 0;
            const maxPolls = 30; // 90 seconds / 3 seconds per poll
            
            // Poll for completion
            const checkInterval = setInterval(async () => {
              pollCount++;
              // Update progress (simulate smooth progress over 90 seconds)
              const estimatedProgress = Math.min(95, (pollCount / maxPolls) * 100);
              setBatchProgress(estimatedProgress);
              
              const checkResponse = await fetch(`${BACKEND_URL}/api/session/${ourSessionId}`);
              const checkData = await checkResponse.json();
              
              if (checkData.fulfillment_status === 'images_ready') {
                clearInterval(checkInterval);
                setBatchProgress(100); // Complete!
                
                // Safe parse - might already be object
                const allImages = typeof checkData.generated_images === 'string' 
                  ? JSON.parse(checkData.generated_images)
                  : checkData.generated_images || {};
                const allSelected = typeof checkData.selected_images === 'string'
                  ? JSON.parse(checkData.selected_images)
                  : checkData.selected_images || {};
                
                if (Object.keys(allSelected).length === 0) {
                  Object.keys(allImages).forEach(idx => {
                    // allImages[idx] is an array of images, select the first one
                    allSelected[idx] = Array.isArray(allImages[idx])
                      ? allImages[idx][0]
                      : allImages[idx];
                  });
                }
                
                setGeneratedImages(allImages);
                setSelectedVariations(allSelected);
                setIsPreviewMode(false);
                
                // Check if order already placed
                if (checkData.fulfillment_status === 'order_placed' || checkData.lulu_print_job_id) {
                  console.log('✅ Order already placed! Showing success page');
                  setOrderNumber(checkData.lulu_print_job_id);
                  setCurrentStep('success');
                } else {
                  setCurrentStep('preview');
                }
              }
            }, 3000); // Check every 3 seconds
            
            // Timeout after 5 minutes (increased from 2 min for parallel generation)
            setTimeout(() => {
              clearInterval(checkInterval);
              console.log('⏰ Generation timeout - images may still be processing');
              // Silently stop polling - user can manually refresh if needed
            }, 300000); // 5 minutes
          }
        } else {
          // No session match found
          setCurrentStep('success');
        }
        
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
            setEditedDedication(session.dedication || '');
            setCoverColor(session.cover_color || 'pink');
            
            const parsedGeneratedImages = typeof session.generated_images === 'string' 
              ? JSON.parse(session.generated_images) 
              : (session.generated_images || {});
            const parsedSelectedVariations = typeof session.selected_variations === 'string'
              ? JSON.parse(session.selected_variations)
              : (session.selected_variations || {});
            
            setGeneratedImages(parsedGeneratedImages);
            setSelectedVariations(parsedSelectedVariations);
            setUploadedImage(session.uploaded_image);
            
            // DEBUG: Show what we have
            console.log('🔍 DEBUG selected_variations count:', Object.keys(parsedSelectedVariations).length);
            console.log('🔍 DEBUG selected_variations keys:', Object.keys(parsedSelectedVariations));
            console.log('🔍 DEBUG generated_images count:', Object.keys(parsedGeneratedImages).length);
            
            // Check if contact is verified
            const isVerified = session.verification_email || session.verification_phone;
            
            if (!isVerified) {
              // Not verified yet - must verify first
              setCurrentStep('verify-contact');
              setContactVerified(false);
            } else if (!session.selected_gender) {
              // Verified but no gender selected
              setContactVerified(true);
              setCurrentStep('gender-select');
            } else if (Object.keys(parsedSelectedVariations).length === 12) {
              // All 12 images done - check if order placed
              setContactVerified(true);
              
              // DEBUG: Check what we actually have
              console.log('🔍 DEBUG (clean URL) fulfillment_status:', session.fulfillment_status);
              console.log('🔍 DEBUG (clean URL) lulu_print_job_id:', session.lulu_print_job_id);
              console.log('🔍 DEBUG (clean URL) payment_status:', session.payment_status);
              
              if (session.fulfillment_status === 'order_placed' || session.lulu_print_job_id) {
                console.log('✅ Order already placed! Showing success page');
                setOrderNumber(session.lulu_print_job_id);
                setCurrentStep('success');
              } else {
                console.log('⏸️  Order not yet placed - showing preview for review');
                setCurrentStep('preview');
              }
            } else {
              // Gender selected but not all images generated
              setContactVerified(true);
              setCurrentStep('personalization');
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

  // Auto-focus first code input when verification code entry appears
  useEffect(() => {
    if (verificationSent && codeInputRefs.current[0]) {
      setTimeout(() => {
        codeInputRefs.current[0]?.focus();
      }, 100);
    }
  }, [verificationSent]);

  // Progress tracking for Van Gogh generation
  useEffect(() => {
    if (currentStep === 'generating-preview' && isGenerating) {
      setGenerationProgress(0);
      setEstimatedTimeLeft(30); // Van Gogh takes ~30 seconds
      
      const interval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 95) return prev; // Stop at 95% until actually done
          const newProgress = prev + 1;
          // Update time proportionally (30 seconds for 95%)
          setEstimatedTimeLeft(Math.round(30 * (1 - newProgress / 95)));
          return newProgress;
        });
      }, 300); // Update every 300ms (30 seconds / 100 = 300ms per %)
      
      return () => clearInterval(interval);
    } else {
      setGenerationProgress(0);
      setEstimatedTimeLeft(30);
    }
  }, [currentStep, isGenerating]);

  // Auto-transition from generating-preview to preview when Van Gogh is done
  useEffect(() => {
    const vanGoghComplete = selectedVariations[6];
    if (currentStep === 'generating-preview' && !isGenerating && vanGoghComplete) {
      console.log('✅ Van Gogh complete! Auto-transitioning to preview...');
      setGenerationProgress(100);
      setTimeout(() => {
        setCurrentStep('preview');
      }, 500); // Brief delay to show 100% completion
    }
  }, [currentStep, isGenerating]); // Removed selectedVariations[6] - was causing infinite re-renders!


  const saveSession = async (updates) => {
    if (!sessionId) {
      console.log('⚠️ No session ID, skipping save');
      return;
    }
    
    try {
      console.log('💾 Saving session:', { sessionId, updates });
      setShowSaveNotification(true);
      
      const response = await fetch(`${BACKEND_URL}/api/session/${sessionId}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Save failed:', response.status, errorText);
        setShowSaveNotification(false);
        return;
      }
      
      const data = await response.json();
      if (data.success) {
        console.log('✅ Session saved');
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

  const handleCaptchaSuccess = (token) => {
    setCaptchaToken(token);
    setCaptchaVerified(true);
    console.log('✅ Captcha verified');
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
    
    // Set uploading state
    setUploadProgress(0);
    setIsUploading(true);
    
    const reader = new FileReader();
    
    // Track file read progress
    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        const percentLoaded = Math.round((e.loaded / e.total) * 50); // First 50% is reading file
        setUploadProgress(percentLoaded);
      }
    };
    
    reader.onload = async (e) => {
      const imageData = e.target.result;
      setUploadedImage(imageData);
      setUploadProgress(60); // File read complete
      
      try {
        const response = await fetch(`${BACKEND_URL}/api/create-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            uploadedImage: imageData,
            captchaToken: captchaToken 
          })
        });
        
        setUploadProgress(80); // Request sent
        
        const data = await response.json();
        
        setUploadProgress(100); // Complete
        
        if (data.success) {
          setSessionId(data.sessionId);
          setCurrentStep('verify-contact');
          window.history.pushState({}, '', `/session/${data.sessionId}`);
          console.log('✅ Session created:', data.sessionId);
        }
      } catch (error) {
        console.error('❌ Failed to create session:', error);
        alert('Failed to create session. Please try again.');
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
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
        setVerificationSent(true);
        setVerificationStep('verify');
        console.log(`✅ Verification code sent`);
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

  const handleCodeInput = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    
    // Only take the last digit if user types multiple
    const digit = value.slice(-1);
    
    const newCode = [...verificationCode];
    newCode[index] = digit;
    setVerificationCode(newCode);

    // Auto-advance to next box
    if (digit && index < 5) {
      codeInputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all 6 digits are filled
    if (digit && index === 5) {
      const fullCode = [...newCode].join('');
      if (fullCode.length === 6) {
        setTimeout(() => verifyCode(fullCode), 100);
      }
    }
  };

  const handleCodePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    
    if (pastedData.length === 6) {
      const newCode = pastedData.split('');
      setVerificationCode(newCode);
      codeInputRefs.current[5]?.focus();
      
      // Auto-verify pasted code
      setTimeout(() => verifyCode(pastedData), 100);
    }
  };

  const handleCodeKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus();
    }
  };

  const verifyCode = async (code) => {
    const codeToVerify = code || verificationCode.join('');
    
    if (codeToVerify.length !== 6) {
      setVerificationError('Please enter all 6 digits');
      return;
    }

    setIsVerifying(true);
    setVerificationError('');

    try {
      const response = await fetch(`${BACKEND_URL}/api/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          code: codeToVerify
        })
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Code verified');
        setContactVerified(true);
        setCurrentStep('gender-select');
      } else {
        setVerificationError(data.error || 'Invalid code. Please try again.');
        setVerificationCode(['', '', '', '', '', '']);
        codeInputRefs.current[0]?.focus();
      }
    } catch (error) {
      console.error('❌ Verification error:', error);
      setVerificationError('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const selectGenderAndStartBatchGeneration = async (gender) => {
    console.log('🎯 Gender selected:', gender);
    setSelectedGender(gender);
    await saveSession({ 
      selected_gender: gender,
      cover_color: coverColor
    });
    
    console.log('✅ Moving to dedication page...');
    // Go to dedication page IMMEDIATELY
    setCurrentStep('dedication');
    
    // Start Van Gogh generation in BACKGROUND
    console.log('🎨 Starting background Van Gogh generation...');
    setIsGenerating(true);
    generatePreviewImage(gender).catch(error => {
      console.error('❌ Background generation error:', error);
      setIsGenerating(false);
      // Still stay on dedication page even if generation fails
    });
  };

  const generatePreviewImage = async (gender = selectedGender) => {
    setIsGenerating(true);
    console.log('🎨 Generating Van Gogh preview...');

    try {
      const vanGoghIndex = 6; // Van Gogh is artist #6
      const artist = artists[vanGoghIndex];
      
      const promptKey = gender === 'Male' ? 'malePrompt' : 
                       gender === 'Female' ? 'femalePrompt' : 
                       gender === 'MalePet' ? 'malePetPrompt' :
                       gender === 'FemalePet' ? 'femalePetPrompt' : 'malePrompt';
      const artistPrompt = artist[promptKey];

      const response = await fetch(`${BACKEND_URL}/api/generate-variations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: uploadedImage,
          artistName: artist.name,
          artistPrompt: artistPrompt,
          count: 1
        })
      });

      const data = await response.json();

      if (data.success && data.variations && data.variations.length > 0) {
        console.log('✅ Van Gogh preview generated!');
        
        // Store only Van Gogh image
        const previewImages = { [vanGoghIndex]: data.variations };
        const previewSelected = { [vanGoghIndex]: data.variations[0] };
        
        setGeneratedImages(previewImages);
        setSelectedVariations(previewSelected);
        setIsPreviewMode(true);

        await saveSession({
          generated_images: previewImages,
          selected_variations: previewSelected,
          is_preview_mode: true
        });

        setIsGenerating(false);
        // Don't auto-transition! User must click "Continue" on dedication page
        // setCurrentStep('preview'); // REMOVED - user controls flow
      } else {
        throw new Error('Failed to generate preview image');
      }
    } catch (error) {
      console.error('❌ Preview generation error:', error);
      setIsGenerating(false);
      alert('Preview generation failed. Please try again.');
    }
  };

  const generateAllTwelve = async (gender = selectedGender) => {
    setBatchGenerating(true);
    setBatchProgress(0);
    console.log('🎨 BATCH: Starting all 12 artists...');

    try {
      const response = await fetch(`${BACKEND_URL}/api/generate-all-12`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: uploadedImage,
          selectedGender: gender,
          artists: artists
        })
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ BATCH COMPLETE!');
        const allImages = data.generatedImages;
        
        // Auto-select first variation for each artist
        const autoSelected = {};
        Object.keys(allImages).forEach(artistIdx => {
          autoSelected[artistIdx] = allImages[artistIdx][0];
        });

        setGeneratedImages(allImages);
        setSelectedVariations(autoSelected);

        await saveSession({
          generated_images: allImages,
          selected_variations: autoSelected,
          current_artist: 12
        });

        setBatchGenerating(false);
        // Don't auto-advance - let user click "Continue to Preview" button
        console.log('✅ Generation complete. Waiting for user to continue.');
      } else {
        throw new Error(data.error || 'Batch generation failed');
      }
    } catch (error) {
      console.error('❌ Batch generation error:', error);
      setBatchGenerating(false);
      setBatchProgress(0);
      
      const retry = confirm('Image generation failed. This might be due to server load. Would you like to try again?');
      if (retry) {
        // Wait 2 seconds then retry
        setTimeout(() => generateAllTwelve(gender), 2000);
      } else {
        alert('Generation cancelled. Please refresh the page to try again or contact support.');
      }
    }
  };

  const regenerateArtist = async (artistIndex) => {
    setIsGenerating(true);
    const artist = artists[artistIndex];
    
    // Determine correct prompt based on gender
    let promptKey;
    if (selectedGender === 'Male') promptKey = 'malePrompt';
    else if (selectedGender === 'Female') promptKey = 'femalePrompt';
    else if (selectedGender === 'MalePet') promptKey = 'malePetPrompt';
    else if (selectedGender === 'FemalePet') promptKey = 'femalePetPrompt';
    
    const artistPrompt = artist[promptKey];

    try {
      console.log(`🎨 Regenerating ${artist.name}...`);
      
      const response = await fetch(`${BACKEND_URL}/api/generate-variations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: uploadedImage,
          artistName: artist.name,
          artistPrompt: artistPrompt,
          count: 1  // Only generate 1 image
        })
      });

      const data = await response.json();

      if (data.success && data.variations && data.variations.length > 0) {
        const newImage = data.variations[0];
        
        // Simply update generatedImages with new image
        setGeneratedImages({
          ...generatedImages,
          [artistIndex]: [newImage]
        });
        
        console.log(`✅ New variation generated`);
      }
    } catch (error) {
      console.error('❌ Regeneration failed:', error);
      alert('Failed to generate new image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Navigate through image history

  const selectNewVariation = async (artistIdx, variation) => {
    const newSelected = { ...selectedVariations, [artistIdx]: variation };
    setSelectedVariations(newSelected);
    await saveSession({ selected_variations: newSelected });
    setShowArtistModal(false);
    setSelectedArtistForChange(null);
  };

  const copyLink = () => {
    const url = `${window.location.origin}/session/${sessionId}`;
    navigator.clipboard.writeText(url);
    setShowCopyNotification(true);
    setTimeout(() => setShowCopyNotification(false), 2000);
  };

  const handleCheckout = async () => {
    try {
      const sessionData = await fetch(`${BACKEND_URL}/api/session/${sessionId}`);
      const session = await sessionData.json();
      const email = session.verification_email || contactValue || 'test@example.com';
      
      const response = await fetch(`${BACKEND_URL}/api/create-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedImages: Object.values(selectedVariations),
          customerEmail: email,
          sessionId
        })
      });
      
      const data = await response.json();
      if (data.success) {
        window.location.href = data.checkoutUrl;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Checkout failed. Please try again.');
    }
  };

  // NEW: Confirm order after user reviews all images
  const handleConfirmOrder = async () => {
    setIsSubmittingOrder(true);
    
    try {
      console.log('📋 Confirming order...');
      
      const response = await fetch(`${BACKEND_URL}/api/confirm-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Order confirmed! Order ID:', data.orderId);
        setOrderNumber(data.orderId);
        
        // Show brief success message (1 second) then redirect
        setTimeout(() => {
          setCurrentStep('success');
          setIsSubmittingOrder(false);
        }, 1000);
      } else {
        alert('Failed to place order: ' + (data.error || 'Unknown error'));
        setIsSubmittingOrder(false);
      }
    } catch (error) {
      console.error('❌ Error placing order:', error);
      alert('Failed to place order. Please try again.');
      setIsSubmittingOrder(false);
    }
  };

  const handleSaveDedication = async () => {
    setDedication(editedDedication);
    await saveSession({ dedication: editedDedication.trim() });
    setShowEditDedication(false);
  };

  const handleCoverChange = async (newType) => {
    setCoverType(newType);
    const newPrice = newType === 'softcover' ? 39.99 : 49.99;
    setPrice(newPrice);
    
    try {
      await fetch(`${BACKEND_URL}/api/sessions/${sessionId}/cover-type`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coverType: newType })
      });
      console.log('✅ Cover type saved');
    } catch (error) {
      console.error('Failed to save cover type:', error);
    }
  };

  return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* HEADER */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={() => setCurrentStep('home')}
            className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="BuildaBook Logo" 
              className="h-10 w-auto"
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-red-600 text-transparent bg-clip-text">
              BuildaBook
            </span>
          </button>
        </div>
      </header>

      {/* Notification Toasts */}
      {showCopiedNotification && (
        <div className="fixed top-20 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          ✓ Link copied to clipboard!
        </div>
      )}

      {showAutosaveNotification && (
        <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm">
          💾 Auto-saved
        </div>
      )}

      {/* HOME STEP */}
      {currentStep === 'home' && (
        <>
          {/* ANIMATED BACKGROUND */}
          <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-amber-50"></div>
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
          </div>

          <section className="relative max-w-7xl mx-auto px-4 py-12">
            {/* HERO SECTION - Split Layout */}
            <div className="grid lg:grid-cols-2 gap-12 items-center mb-24">
              {/* LEFT: Copy + CTA */}
              <div className="space-y-6 order-2 lg:order-1">
                {/* Social Proof Badge */}
                <div className="inline-flex items-center gap-3 bg-white/90 backdrop-blur-sm px-5 py-3 rounded-full shadow-xl border border-amber-200">
                  <div className="flex -space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white"></div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 border-2 border-white"></div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 border-2 border-white"></div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-white"></div>
                  </div>
                  <span className="text-sm font-bold text-amber-600">
                    {masterpieceCount.toLocaleString()}+ masterpieces created ✨
                  </span>
                </div>
                
                <h1 className="text-5xl md:text-7xl font-black leading-tight">
                  Turn Any Photo Into
                  <span className="block mt-2 bg-gradient-to-r from-amber-600 via-red-600 to-pink-600 text-transparent bg-clip-text">
                    Museum-Quality Art
                  </span>
                </h1>
                
                <p className="text-xl md:text-2xl text-gray-700 leading-relaxed">
                  See yourself painted by <span className="font-black text-amber-600">12 legendary artists</span> in a stunning 32-page gift book
                </p>
                
                {/* Trust Badges */}
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md border-2 border-green-200">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="font-bold text-sm">FREE Preview</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md border-2 border-purple-200">
                    <Check className="w-5 h-5 text-purple-600" />
                    <span className="font-bold text-sm">30-Day Guarantee</span>
                  </div>
                </div>

                {/* Primary CTA */}
                {!uploadedImage && (
                  <div className="space-y-4 pt-4">
                    <button
                      onClick={() => {
                        trackEvent('get_started_click');
                        const uploadSection = document.getElementById('upload-section');
                        if (uploadSection) {
                          uploadSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        } else {
                          fileInputRef.current?.click();
                        }
                      }}
                      className="group relative w-full lg:w-auto px-10 py-5 bg-gradient-to-r from-amber-600 via-red-600 to-pink-600 text-white rounded-2xl font-black text-xl shadow-2xl hover:shadow-amber-500/50 transition-all duration-300 transform hover:scale-105 overflow-hidden">
                      <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      <span className="relative flex items-center justify-center gap-3">
                        <Upload className="w-6 h-6 group-hover:animate-bounce" />
                        Get Started FREE
                      </span>
                    </button>
                    <p className="text-center lg:text-left text-sm text-gray-600">
                      🔒 <span className="font-semibold">No credit card</span> • See your Van Gogh in 30 seconds
                    </p>
                  </div>
                )}
              </div>

              {/* RIGHT: 3D Book Mockup */}
              <div className="space-y-8 order-1 lg:order-2">
                <div className="relative group" style={{perspective: '1000px'}}>
                  {/* 3D ANIMATED BOOK */}
                  <div className={`relative cursor-pointer perspective-container ${isBookOpen ? 'book-open' : ''}`}
                    onMouseEnter={() => setIsBookOpen(true)}
                    onMouseLeave={() => setIsBookOpen(false)}
                  >
                    <style>{`
                      .perspective-container {
                        perspective: 2000px;
                      }
                      
                      .book-3d {
                        transform-style: preserve-3d;
                        transition: all 0.8s cubic-bezier(0.4, 0.0, 0.2, 1);
                      }
                      
                      /* Cover flips open */
                      .book-cover {
                        transform-origin: left center;
                        transform-style: preserve-3d;
                        transition: transform 0.8s cubic-bezier(0.4, 0.0, 0.2, 1);
                        backface-visibility: visible;
                      }
                      
                      .book-open .book-cover {
                        transform: rotateY(-160deg);
                      }
                      
                      /* AI page - simple opacity reveal, no flip */
                      .book-page-1 {
                        opacity: 0;
                        transition: opacity 0.4s ease 0.6s;
                      }
                      
                      .book-open .book-page-1 {
                        opacity: 1;
                      }
                      
                      .book-shadow {
                        transition: all 0.8s ease;
                      }
                      
                      .group:hover .book-shadow {
                        opacity: 0.3;
                        transform: translateX(-30px) scale(1.2);
                      }
                    `}</style>

                    {/* Glow effect behind book */}
                    <div className="absolute -inset-8 bg-gradient-to-r from-amber-400 via-red-400 to-pink-400 rounded-3xl blur-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-700"></div>
                    
                    {/* Shadow on LEFT side (book spine side) */}
                    <div className="book-shadow absolute -left-8 inset-y-0 w-16 bg-black/20 blur-xl"></div>

                    {/* The actual 3D book */}
                    <div className="book-3d relative max-w-md mx-auto">
                      {/* BOOK SPINE (left side) */}
                      <div className="absolute left-0 top-0 w-12 h-full bg-gradient-to-r from-amber-800 to-amber-600 rounded-l-lg" style={{transform: 'translateZ(-10px)'}}></div>
                      
                      {/* COVER (flips open on hover) */}
                      <div className="book-cover absolute inset-0 rounded-l-2xl shadow-2xl overflow-hidden" style={{zIndex: 30, aspectRatio: '1/1'}}>
                        <div className="absolute inset-0 bg-gradient-to-br from-green-700 via-green-600 to-amber-700 p-8 flex flex-col items-center justify-center text-white border-4 border-amber-100 rounded-l-2xl">
                          <div className="absolute inset-0 opacity-10" style={{
                            backgroundImage: 'radial-gradient(circle at 20% 50%, transparent 0%, rgba(0,0,0,0.3) 100%)'
                          }}></div>
                          <div className="relative z-10 text-center space-y-3">
                            <h3 className="font-serif text-5xl font-normal drop-shadow-xl tracking-wide" style={{fontFamily: 'Georgia, serif'}}>
                              Your Name
                            </h3>
                            <div className="space-y-1">
                              <p className="font-serif text-3xl font-light italic opacity-95" style={{fontFamily: 'Georgia, serif'}}>
                                painted by
                              </p>
                              <p className="font-serif text-3xl font-light lowercase drop-shadow-lg" style={{fontFamily: 'Georgia, serif'}}>
                                great masters
                              </p>
                              <p className="font-serif text-3xl font-light lowercase drop-shadow-lg" style={{fontFamily: 'Georgia, serif'}}>
                                of art
                              </p>
                            </div>
                          </div>
                          <div className="absolute left-0 top-0 w-8 h-full bg-gradient-to-r from-black/30 to-transparent"></div>
                        </div>
                      </div>

                      {/* PAGE 1 (AI image - fades in when cover opens, positioned on LEFT) - SLIDESHOW */}
                      <div className="book-page-1 absolute left-0 top-0 rounded-2xl shadow-2xl overflow-hidden" style={{zIndex: 25, aspectRatio: '1/1', width: '100%'}}>
                        <div className="w-full h-full bg-gray-900 flex items-center justify-center p-8 border-4 border-white rounded-2xl">
                          <div className="w-full h-full rounded-xl overflow-hidden shadow-2xl relative">
                            {/* Cycle through all 12 artists */}
                            {artistSlideshow.map((artistFilename, index) => (
                              <img 
                                key={artistFilename}
                                src={`/samples/male/${artistFilename}.jpg`}
                                alt={`${artistFilename} Style Sample`}
                                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
                                style={{
                                  opacity: homepageArtistIndex === index ? 1 : 0,
                                  zIndex: homepageArtistIndex === index ? 1 : 0
                                }}
                                onError={(e) => {
                                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23374151" width="400" height="400"/%3E%3Ctext x="50%25" y="45%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="24" fill="%23fff" font-weight="bold"%3ESample%3C/text%3E%3C/svg%3E';
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* PAGE 2 (Van Gogh Info - positioned on RIGHT) */}
                      <div className="relative rounded-2xl shadow-2xl overflow-hidden border-4 border-white bg-white" style={{aspectRatio: '1/1'}}>
                        <div className="absolute inset-0 flex items-center justify-center p-6">
                          <div className="w-full h-full">
                            <img 
                              src="/book-pages/vangogh-info.png"
                              alt="Van Gogh Info"
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                e.target.parentElement.innerHTML = `
                                  <div class="flex flex-col items-center justify-center h-full text-gray-800 p-4">
                                    <h3 class="text-2xl font-bold mb-2">Vincent van Gogh</h3>
                                    <p class="text-sm text-gray-600 mb-3">1853-1890 • Post-Impressionism</p>
                                    <div class="text-xs text-gray-700 leading-relaxed text-center">
                                      <p class="mb-2">Master of bold colors and emotional brushwork</p>
                                      <p class="mb-2">Famous works: Starry Night, Sunflowers</p>
                                      <p>Revolutionary style that shaped modern art</p>
                                    </div>
                                  </div>
                                `;
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Page edges effect */}
                      <div className="absolute right-0 top-1 w-2 h-[calc(100%-8px)] bg-gradient-to-r from-gray-100 via-white to-gray-100 rounded-r" style={{transform: 'translateZ(-5px)'}}></div>
                      <div className="absolute right-0 top-2 w-2 h-[calc(100%-16px)] bg-gradient-to-r from-gray-200 via-white to-gray-200 rounded-r" style={{transform: 'translateZ(-10px)'}}></div>
                    </div>

                    {/* Badges */}
                    <div className="absolute -top-4 -right-4 bg-gradient-to-br from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-xl font-black text-sm shadow-2xl animate-bounce z-20">
                      32 Pages ✨
                    </div>
                    <div className="absolute -bottom-4 -left-4 bg-gradient-to-br from-green-400 to-emerald-600 text-white px-4 py-2 rounded-xl font-black text-sm shadow-2xl z-20">
                      Premium
                    </div>
                  </div>
                </div>

                {/* VIDEO SECTION - Optimized for large file */}
                <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden shadow-2xl">
                  <video 
                    id="transformation-video"
                    className="w-full aspect-video object-cover"
                    controls
                    poster="/video-thumbnail.jpg"
                    preload="none"
                    playsInline
                    loading="lazy"
                    onPlay={(e) => {
                      // Hide play button when video starts
                      const playButton = e.target.parentElement.querySelector('.play-button-overlay');
                      if (playButton) playButton.style.opacity = '0';
                    }}
                    onPause={(e) => {
                      // Show play button when paused
                      const playButton = e.target.parentElement.querySelector('.play-button-overlay');
                      if (playButton) playButton.style.opacity = '1';
                    }}
                  >
                    <source src="/transformation-video.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  
                  {/* Play button overlay - CLICKABLE, starts video */}
                  <div 
                    className="play-button-overlay absolute inset-0 flex items-center justify-center transition-opacity duration-300 cursor-pointer"
                    onClick={() => {
                      const video = document.getElementById('transformation-video');
                      if (video) {
                        video.play();
                        trackEvent('video_play');
                      }
                      // Also open the book slideshow
                      setIsBookOpen(true);
                      trackEvent('book_open', { trigger: 'video_button' });
                    }}
                  >
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center hover:bg-white/30 hover:scale-110 transition-all">
                      <div className="w-0 h-0 border-l-[24px] border-l-white border-y-[14px] border-y-transparent ml-1"></div>
                    </div>
                  </div>
                  
                  <div className="absolute bottom-4 left-4 right-4 text-white pointer-events-none">
                    <p className="text-lg font-bold drop-shadow-lg">See What It's All About</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 12 ARTISTS INTERACTIVE GRID */}
            {!uploadedImage && (
              <div className="mb-24">
                <div className="text-center mb-12">
                  <h2 className="text-4xl md:text-6xl font-black mb-4">
                    12 Legendary Artists Paint <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-red-600">YOU</span>
                  </h2>
                </div>

                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {[
                    { name: 'Van Gogh', displayName: 'Post-Impressionism', image: 'vangogh.jpg', color: 'from-blue-600 to-yellow-500' },
                    { name: 'Cubism', displayName: 'Cubism', image: 'picasso.jpg', color: 'from-red-600 to-pink-500' },
                    { name: 'Pop Art', displayName: 'Pop Art', image: 'warhol.jpg', color: 'from-purple-600 to-pink-500' },
                    { name: 'Monet', displayName: 'Impressionism', image: 'monet.jpg', color: 'from-blue-500 to-green-400' },
                    { name: 'Da Vinci', displayName: 'Renaissance', image: 'davinci.jpg', color: 'from-amber-700 to-yellow-600' },
                    { name: 'Surrealism', displayName: 'Surrealism', image: 'dali.jpg', color: 'from-orange-600 to-red-500' },
                    { name: 'Rembrandt', displayName: 'Baroque', image: 'rembrandt.jpg', color: 'from-amber-800 to-orange-600' },
                    { name: 'Munch', displayName: 'Expressionism', image: 'munch.jpg', color: 'from-red-700 to-orange-500' },
                    { name: 'Vermeer', displayName: 'Dutch Golden Age', image: 'vermeer.jpg', color: 'from-blue-700 to-cyan-500' },
                    { name: 'Michelangelo', displayName: 'High Renaissance', image: 'michelangelo.jpg', color: 'from-gray-600 to-blue-400' },
                    { name: 'Raphael', displayName: 'Renaissance', image: 'raphael.jpg', color: 'from-pink-500 to-rose-400' },
                    { name: 'Grant Wood', displayName: 'American Realism', image: 'grantwood.jpg', color: 'from-green-700 to-yellow-600' }
                  ].map((artist, idx) => (
                    <div key={idx} className="group relative bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 cursor-default">
                      <div className={`absolute inset-0 bg-gradient-to-br ${artist.color} opacity-0 group-hover:opacity-30 transition-opacity duration-500`}></div>
                      <div className="relative aspect-square">
                        <img 
                          src={`/artist-thumbnails/${artist.image}`} 
                          alt={`${artist.displayName} by ${artist.name}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-gradient-to-br ${artist.color}"><span class="text-6xl text-white font-bold">${artist.name.charAt(0)}</span></div>`;
                          }}
                        />
                      </div>
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                        <p className="font-bold text-sm text-white">{artist.displayName}</p>
                        <p className="text-xs text-white/80">{artist.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PROBLEM/SOLUTION SPLIT */}
            {!uploadedImage && (
              <div className="mb-24 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-orange-100 rounded-[3rem] transform -rotate-1"></div>
                <div className="relative bg-white rounded-[3rem] p-8 md:p-16 shadow-2xl">
                  <h2 className="text-4xl md:text-6xl font-black text-center mb-12">
                    The Gift That <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-red-600">Nobody</span> Forgets
                  </h2>
                  <div className="grid lg:grid-cols-2 gap-8 md:gap-12">
                    <div className="space-y-6 p-8 bg-gray-50 rounded-3xl">
                      <div className="text-7xl">😕</div>
                      <h3 className="text-2xl md:text-3xl font-black text-gray-800">The Problem</h3>
                      <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                        Generic presents get forgotten. Photo frames collect dust. Gift cards feel impersonal. 
                        <span className="block mt-3 font-semibold">Nothing feels truly special anymore.</span>
                      </p>
                    </div>
                    <div className="space-y-6 p-8 bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border-4 border-amber-200">
                      <div className="text-7xl">🎁</div>
                      <h3 className="text-2xl md:text-3xl font-black text-amber-900">The Solution</h3>
                      <p className="text-lg md:text-xl text-gray-800 leading-relaxed">
                        A one-of-a-kind art book so breathtaking they'll display it on their coffee table. 
                        <span className="block mt-3 font-bold text-amber-700">Something they'll show everyone who visits.</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SAMPLE BOOKS - Interactive Preview */}
            {!uploadedImage && (
              <div className="mb-24">
                <div className="text-center mb-12">
                  <h2 className="text-4xl md:text-6xl font-black mb-4">
                    See <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Real Examples</span>
                  </h2>
                  <p className="text-xl text-gray-600">Click to browse complete 32-page books</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-10">
                  {[
                    { type: 'male', icon: '👨', title: 'Male Portrait', desc: 'Professional transformed by 12 masters', gradient: 'from-blue-600 to-blue-700' },
                    { type: 'female', icon: '👩', title: 'Female Portrait', desc: 'Elegant beauty across all styles', gradient: 'from-pink-600 to-red-600' },
                    { type: 'pet', icon: '🐕', title: 'Pet Portrait', desc: 'Even furry friends become art!', gradient: 'from-green-600 to-teal-600' }
                  ].map((sample) => (
                    <button
                      key={sample.type}
                      onClick={() => {
                        trackEvent('sample_book_open', { type: sample.type });
                        setCurrentSampleBook(sample.type);
                        setShowSampleBrowser(true);
                      }}
                      className="group relative bg-white rounded-[2.5rem] p-10 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 overflow-hidden">
                      <div className={`absolute inset-0 bg-gradient-to-br ${sample.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                      
                      <div className="relative z-10 space-y-6">
                        <div className="text-8xl transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">{sample.icon}</div>
                        <div>
                          <h3 className="text-3xl font-black mb-3">{sample.title}</h3>
                          <p className="text-gray-600 text-lg">{sample.desc}</p>
                        </div>
                        <div className={`bg-gradient-to-r ${sample.gradient} text-white py-4 px-8 rounded-2xl font-black text-lg group-hover:shadow-2xl transition-all inline-flex items-center gap-3`}>
                          View Sample
                          <span className="transform group-hover:translate-x-2 transition-transform">→</span>
                        </div>
                      </div>

                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* HOW IT WORKS - Timeline */}
            {!uploadedImage && (
              <div className="mb-24">
                <h2 className="text-4xl md:text-6xl font-black text-center mb-16">
                  Simple as <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-red-600">1-2-3-4</span>
                </h2>
                
                <div className="relative max-w-5xl mx-auto">
                  {/* Connection line - desktop only */}
                  <div className="hidden lg:block absolute top-12 left-0 right-0 h-2 bg-gradient-to-r from-amber-300 via-red-300 to-pink-300 rounded-full"></div>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4 relative">
                    {[
                      { num: '1', icon: '📸', title: 'Upload', desc: 'Any photo - you, family, pets' },
                      { num: '2', icon: '🎨', title: 'Preview FREE', desc: 'Van Gogh in 30 seconds' },
                      { num: '3', icon: '✨', title: 'Personalize', desc: 'Name, dedication, colors' },
                      { num: '4', icon: '📦', title: 'Delivered', desc: 'Ships in 7-10 days' }
                    ].map((step, idx) => (
                      <div key={idx} className="relative text-center group">
                        <div className="w-24 h-24 bg-gradient-to-br from-amber-600 to-red-600 text-white rounded-3xl flex items-center justify-center text-4xl font-black mx-auto mb-6 shadow-2xl relative z-10 group-hover:scale-125 group-hover:rotate-6 transition-all duration-500">
                          {step.num}
                        </div>
                        <div className="text-6xl mb-4 group-hover:scale-125 transition-transform">{step.icon}</div>
                        <h3 className="font-black text-2xl mb-3">{step.title}</h3>
                        <p className="text-gray-600 text-lg">{step.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* MAIN CTA - Upload Section */}
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-6xl font-black mb-6">
                  {uploadedImage ? '✓ Ready to Create!' : 'Create Your Masterpiece'}
                </h2>
                {!uploadedImage && (
                  <p className="text-2xl text-gray-600">
                    Upload now → See <span className="font-black text-amber-600">FREE Van Gogh preview</span> in 30 seconds
                  </p>
                )}
              </div>

              <div
                id="upload-section"
                className={`relative border-4 border-dashed rounded-[3rem] p-16 transition-all duration-500 ${
                  isDragging 
                    ? 'border-amber-600 bg-amber-50 scale-105 shadow-2xl' 
                    : uploadedImage 
                      ? 'border-green-500 bg-green-50 shadow-2xl'
                      : 'border-gray-300 bg-white/50 backdrop-blur-sm hover:border-amber-400 hover:bg-amber-50/50 hover:scale-105 shadow-xl'
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}>
                
                {uploadedImage ? (
                  <div className="text-center space-y-8">
                    <div className="relative inline-block">
                      <img
                        src={uploadedImage}
                        alt="Uploaded"
                        className="mx-auto max-w-md rounded-3xl shadow-2xl border-8 border-white"
                      />
                      <div className="absolute -top-6 -right-6 bg-green-500 text-white p-5 rounded-3xl shadow-xl animate-bounce">
                        <Check className="w-10 h-10" />
                      </div>
                    </div>
                    <p className="text-green-600 font-black text-3xl">Perfect! Let's create your masterpiece ✨</p>
                  </div>
                ) : (
                  <div className="text-center space-y-8">
                    <div className="relative inline-block">
                      <Upload className="w-32 h-32 mx-auto text-amber-600 animate-bounce" />
                      <div className="absolute inset-0 bg-amber-400 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                    </div>
                    <div>
                      <h3 className="text-4xl font-black mb-4">Drop Your Photo Here</h3>
                      <p className="text-gray-600 text-xl">Or click below to browse</p>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      onClick={() => {
                        trackEvent('upload_click');
                        fileInputRef.current?.click();
                      }}
                      className="px-14 py-7 bg-gradient-to-r from-amber-600 to-red-600 text-white rounded-2xl font-black text-2xl shadow-2xl hover:shadow-amber-500/50 transition-all duration-500 transform hover:scale-110">
                      Choose Photo
                    </button>
                    <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                      {['No credit card', 'FREE preview', 'Secure & private'].map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Check className="w-5 h-5 text-green-600" />
                          <span className="font-semibold">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* CAPTCHA SECTION */}
            {!captchaVerified && (
              <div className="mt-8 text-center">
                <p className="text-gray-600 mb-4">Complete security check to continue:</p>
                <div className="flex justify-center">
                  <Turnstile
                    siteKey={TURNSTILE_SITE_KEY}
                    onSuccess={handleCaptchaSuccess}
                    theme="light"
                  />
                </div>
              </div>
            )}

            {captchaVerified && !uploadedImage && (
              <div className="mt-8 text-center">
                <p className="text-green-600 font-semibold">✓ Verified! You can now upload your photo above.</p>
              </div>
            )}

            {isUploading && (
              <div className="mt-8 max-w-md mx-auto">
                <div className="bg-white rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center justify-center mb-4">
                    <Loader className="w-8 h-8 animate-spin text-amber-600 mr-3" />
                    <p className="text-lg font-semibold text-gray-700">Uploading Your Photo...</p>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden mb-4">
                    <div 
                      className="absolute left-0 top-0 h-full bg-gradient-to-r from-amber-500 to-red-500 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">{uploadProgress}% Complete</span>
                    <span className="text-sm text-gray-600">
                      {uploadProgress < 60 ? 'Reading file...' : 
                       uploadProgress < 80 ? 'Creating session...' : 
                       uploadProgress < 100 ? 'Almost done...' : 'Complete!'}
                    </span>
                  </div>
                  
                  {/* Warning */}
                  <div className="mt-4 bg-yellow-50 border-2 border-yellow-400 rounded-xl p-4">
                    <p className="text-yellow-800 font-semibold text-center flex items-center justify-center gap-2">
                      <span className="text-2xl">⚠️</span>
                      Please don't refresh or close this page!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {uploadedImage && sessionId && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => setCurrentStep('verify-contact')}
                  className="px-12 py-4 bg-gradient-to-r from-amber-600 to-red-600 text-white rounded-full font-bold text-xl hover:shadow-xl transition">
                  Continue →
                </button>
              </div>
            )}
          </section>

          {/* CUSTOM ANIMATIONS CSS */}
          <style>{`
            @keyframes blob {
              0%, 100% { transform: translate(0, 0) scale(1); }
              25% { transform: translate(20px, -50px) scale(1.1); }
              50% { transform: translate(-20px, 20px) scale(0.9); }
              75% { transform: translate(50px, 50px) scale(1.05); }
            }
            .animate-blob {
              animation: blob 7s infinite;
            }
            .animation-delay-2000 {
              animation-delay: 2s;
            }
            .animation-delay-4000 {
              animation-delay: 4s;
            }
          `}</style>
        </>
      )}

      {/* VERIFY CONTACT STEP */}
      {currentStep === 'verify-contact' && (
        <section className="max-w-3xl mx-auto px-4 py-20">
          {!contactVerified ? (
            <div>
              {!verificationSent ? (
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl">
                  <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
                    Save Your Progress! 📧
                  </h2>
                  <p className="text-gray-600 text-center mb-2 text-lg">
                    We'll send you a secure link so you can access your masterpiece anytime
                  </p>
                  <p className="text-gray-500 text-center mb-8 text-sm">
                    Don't worry - we'll never spam you or share your info
                  </p>

                  {/* Email Input Only */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Your Email Address
                    </label>
                    <input
                      type="email"
                      value={contactValue}
                      onChange={(e) => setContactValue(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:border-amber-600 focus:outline-none text-lg transition"
                      autoFocus
                    />
                  </div>

                  <button
                    onClick={requestVerification}
                    disabled={isVerifying || !contactValue.trim()}
                    className="w-full py-4 bg-gradient-to-r from-amber-600 to-red-600 text-white rounded-full font-bold text-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed">
                    {isVerifying ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader className="w-5 h-5 animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      'Send Me the Code →'
                    )}
                  </button>
                  
                  <p className="text-xs text-gray-400 text-center mt-4">
                    🔒 Secure verification • Your info is safe with us
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl">
                  <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
                    Check Your {contactMethod === 'email' ? 'Email' : 'Phone'} 📬
                  </h2>
                  <p className="text-gray-600 text-center mb-2 text-lg">
                    We sent a 6-digit code to:
                  </p>
                  <p className="text-amber-600 font-bold text-center mb-8 text-xl">
                    {contactValue}
                  </p>

                  <div className="flex justify-center gap-2 mb-8">
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <input
                        key={index}
                        ref={(el) => (codeInputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={verificationCode[index] || ''}
                        onChange={(e) => handleCodeInput(index, e.target.value)}
                        onPaste={index === 0 ? handleCodePaste : undefined}
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
                            codeInputRefs.current[index - 1]?.focus();
                          }
                        }}
                        className="w-12 h-14 md:w-16 md:h-20 text-center text-2xl md:text-3xl font-bold border-2 border-gray-300 rounded-xl focus:border-amber-600 focus:outline-none transition"
                      />
                    ))}
                  </div>

                  {verificationError && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-4">
                      <p className="text-red-600 text-center font-semibold">{verificationError}</p>
                    </div>
                  )}

                  <div className="text-center text-sm text-gray-600">
                    Didn't receive it?{' '}
                    <button
                      onClick={requestVerification}
                      disabled={isVerifying}
                      className="text-amber-600 hover:text-amber-700 font-semibold underline disabled:opacity-50">
                      Resend code
                    </button>
                  </div>
                  
                  <p className="text-xs text-gray-400 text-center mt-6">
                    💡 Check your spam folder if you don't see it
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </section>
      )}

      {/* GENDER SELECT STEP - NOW FIRST */}
      {currentStep === 'gender-select' && (
        <section className="max-w-6xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Choose Your Style</h2>
            <p className="text-lg md:text-xl text-gray-600">
              Select how you'd like to be portrayed across all 12 legendary artists
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <button
              onClick={() => selectGenderAndStartBatchGeneration('Male')}
              className="group relative bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl p-8 hover:shadow-2xl transition transform hover:scale-105">
              <div className="text-center">
                <div className="text-6xl mb-4">👨</div>
                <h3 className="text-2xl font-bold text-white mb-2">Male</h3>
                <p className="text-blue-100 text-sm">Human portraits</p>
              </div>
            </button>

            <button
              onClick={() => selectGenderAndStartBatchGeneration('Female')}
              className="group relative bg-gradient-to-br from-pink-500 to-red-600 rounded-3xl p-8 hover:shadow-2xl transition transform hover:scale-105">
              <div className="text-center">
                <div className="text-6xl mb-4">👩</div>
                <h3 className="text-2xl font-bold text-white mb-2">Female</h3>
                <p className="text-pink-100 text-sm">Human portraits</p>
              </div>
            </button>

            <button
              onClick={() => selectGenderAndStartBatchGeneration('MalePet')}
              className="group relative bg-gradient-to-br from-green-500 to-teal-600 rounded-3xl p-8 hover:shadow-2xl transition transform hover:scale-105">
              <div className="text-center">
                <div className="text-6xl mb-4">🐕</div>
                <h3 className="text-2xl font-bold text-white mb-2">Male Pet</h3>
                <p className="text-green-100 text-sm">Masculine pet styles</p>
              </div>
            </button>

            <button
              onClick={() => selectGenderAndStartBatchGeneration('FemalePet')}
              className="group relative bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl p-8 hover:shadow-2xl transition transform hover:scale-105">
              <div className="text-center">
                <div className="text-6xl mb-4">🐈</div>
                <h3 className="text-2xl font-bold text-white mb-2">Female Pet</h3>
                <p className="text-purple-100 text-sm">Feminine pet styles</p>
              </div>
            </button>
          </div>
        </section>
      )}

      {/* DEDICATION STEP - NEW! User fills out while Van Gogh generates */}
      {currentStep === 'dedication' && (
        <section className="max-w-4xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Personalize Your Book</h2>
            <p className="text-gray-600">Add your name and a special message</p>
            {isGenerating && (
              <div className="mt-4 inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
                <Loader className="w-4 h-4 text-blue-600 animate-spin" />
                <span className="text-sm text-blue-600 font-semibold">Van Gogh preview generating in background...</span>
              </div>
            )}
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

            <div className="mb-8">
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                Cover Color
              </label>
              <div className="grid grid-cols-5 gap-4">
                {colorOptions.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setCoverColor(color.name)}
                    className={`p-4 rounded-xl border-4 transition ${
                      coverColor === color.name ? 'border-amber-600 scale-105' : 'border-gray-200'
                    }`}>
                    <div className={`w-full h-16 rounded-lg ${color.bg} mb-2`}></div>
                    <p className="text-xs font-semibold">{color.label}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={async () => {
                  if (!customerName.trim()) {
                    alert('Please enter your name');
                    return;
                  }
                  
                  await saveSession({
                    customer_name: customerName,
                    dedication: dedication,
                    cover_color: coverColor
                  });
                  
                  // Check if Van Gogh is done generating
                  if (selectedVariations[6]) {
                    // Already done! Go straight to preview
                    setCurrentStep('preview');
                  } else {
                    // Still generating, show loading screen
                    setCurrentStep('generating-preview');
                  }
                }}
                disabled={!customerName.trim()}
                className="px-12 py-4 bg-gradient-to-r from-amber-600 to-red-600 text-white rounded-full font-bold text-xl hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed">
                Continue to Preview →
              </button>
            </div>
          </div>
        </section>
      )}

      {/* GENERATING PREVIEW (VAN GOGH ONLY) */}
      {currentStep === 'generating-preview' && (
        <section className="max-w-3xl mx-auto px-4 py-20">
          <div className="bg-white rounded-3xl p-12 shadow-xl text-center">
            <div className="w-24 h-24 mx-auto mb-8">
              <Loader className="w-full h-full text-amber-600 animate-spin" />
            </div>

            <h2 className="text-4xl font-bold mb-4">Creating Your Van Gogh Preview...</h2>
            <p className="text-xl text-gray-600 mb-8">
              Generating your portrait in Van Gogh's style
            </p>

            {/* PROGRESS BAR */}
            <div className="mb-6">
              <div className="bg-gray-200 rounded-full h-6 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-red-500 h-full transition-all duration-300 flex items-center justify-center text-white text-sm font-bold"
                  style={{ width: `${generationProgress}%` }}>
                  {generationProgress > 10 && `${Math.round(generationProgress)}%`}
                </div>
              </div>
            </div>

            {/* COUNTDOWN TIMER */}
            <p className="text-lg text-gray-500 mb-4">
              Estimated time remaining: <span className="font-bold text-amber-600">
                {estimatedTimeLeft}s
              </span>
            </p>

            <div className="mt-8 text-sm text-gray-400">
              <p>🎨 Your preview will be ready in about 30 seconds</p>
            </div>
          </div>
        </section>
      )}

      {/* BATCH GENERATING STEP - WITH REAL PROGRESS */}
      {currentStep === 'batch-generating' && (
        <section className="max-w-3xl mx-auto px-4 py-20">
          <div className="bg-white rounded-3xl p-12 shadow-xl text-center">
            <div className="w-24 h-24 mx-auto mb-8">
              <svg className="animate-spin" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>

            <h2 className="text-4xl font-bold mb-4">Creating All 12 Masterpieces...</h2>
            <p className="text-xl text-gray-600 mb-8">
              Please wait while we generate your portraits in the styles of all 12 legendary artists
            </p>

            {/* REAL PROGRESS BAR */}
            <div className="mb-6">
              <div className="bg-gray-200 rounded-full h-6 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-red-500 h-full transition-all duration-500 flex items-center justify-center text-white text-sm font-bold"
                  style={{ width: `${batchProgress}%` }}>
                  {batchProgress > 10 && `${Math.round(batchProgress)}%`}
                </div>
              </div>
            </div>

            {/* TIMER COUNTDOWN */}
            <p className="text-lg text-gray-500">
              Estimated time remaining: <span className="font-bold text-amber-600">
                {Math.max(0, Math.ceil((90 - (batchProgress / 100) * 90)))}s
              </span>
            </p>

            <div className="mt-8 text-sm text-gray-400">
              <p>💡 While you wait, your images are being created in parallel</p>
              <p className="mt-2">This typically takes 60-90 seconds</p>
            </div>
          </div>
        </section>
      )}

      {/* PERSONALIZATION STEP - NOW SECOND (after generation starts) */}
      {currentStep === 'personalization' && (
        <section className="max-w-4xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Personalize Your Masterpiece</h2>
            <p className="text-gray-600">Add your name, dedication, and choose your cover color</p>
            {batchGenerating ? (
              <p className="text-sm text-amber-600 mt-2">⏳ Your 12 portraits are generating in the background...</p>
            ) : Object.keys(selectedVariations).length === 12 ? (
              <p className="text-sm text-green-600 mt-2">✅ All 12 portraits are ready! Continue when you're done personalizing.</p>
            ) : null}
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

            <div className="mb-8">
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                Cover Color
              </label>
              <div className="grid grid-cols-4 gap-4">
                {colorOptions.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setCoverColor(color.name)}
                    className={`p-4 rounded-xl border-4 transition ${
                      coverColor === color.name ? 'border-amber-600 scale-105' : 'border-gray-200'
                    }`}>
                    <div className={`w-full h-16 rounded-lg ${color.bg} mb-2`}></div>
                    <p className="text-sm font-semibold">{color.label}</p>
                  </button>
                ))}
              </div>
              
              {/* Color Preview Box */}
              <div className="mt-6 p-6 bg-gray-50 rounded-xl border-2 border-gray-200">
                <p className="text-sm text-gray-600 mb-3 text-center font-semibold">Preview Your Cover:</p>
                <div className="flex items-center justify-center">
                  <div 
                    className={`relative w-64 h-40 rounded-lg shadow-xl flex items-center justify-center ${
                      coverColor === 'blue' ? 'bg-blue-500' :
                      coverColor === 'dark-green' ? 'bg-emerald-800' :
                      coverColor === 'green' ? 'bg-green-500' :
                      coverColor === 'orange' ? 'bg-orange-500' :
                      coverColor === 'purple' ? 'bg-purple-500' : 'bg-blue-500'
                    }`}>
                    <p className="text-white font-bold text-3xl text-center" style={{
                      textShadow: '2px 2px 4px rgba(0,0,0,0.4)',
                      fontFamily: 'serif'
                    }}>
                      {customerName || 'Your Name'}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 text-center mt-3">
                  {colorOptions.find(c => c.name === coverColor)?.label || 'Blue'} Cover
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={async () => {
                  if (!customerName.trim()) {
                    alert('Please enter your name');
                    return;
                  }
                  
                  await saveSession({
                    customer_name: customerName,
                    dedication: dedication,
                    cover_color: coverColor
                  });
                  
                  setCurrentStep('preview');
                }}
                className="px-12 py-4 bg-gradient-to-r from-amber-600 to-red-600 text-white rounded-full font-bold text-xl hover:shadow-xl transition">
                Continue to Preview →
              </button>
            </div>
          </div>
        </section>
      )}

      {/* PREVIEW STEP - COMPLETE WITH FULL FLIPBOOK */}
      {currentStep === 'preview' && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">🎨 Your {isPreviewMode ? 'Preview' : '12 Masterpieces'}</h2>
            <p className="text-lg md:text-xl text-gray-600">
              {isPreviewMode ? 'See yourself as Van Gogh + sample images from other artists' : 'All 12 artists complete! Review your collection below'}
            </p>
          </div>

          {/* PREVIEW MODE BANNER */}
          {isPreviewMode && (
            <div className="max-w-4xl mx-auto mb-12 bg-gradient-to-r from-yellow-50 to-amber-50 border-4 border-amber-400 rounded-2xl p-8 shadow-xl">
              <div className="text-center">
                <h3 className="text-3xl font-bold text-amber-900 mb-4">
                  ✨ Preview Mode
                </h3>
                <p className="text-xl text-amber-800 mb-6">
                  You're viewing <span className="font-bold">YOUR Van Gogh portrait</span> mixed with sample images from the other 11 artists.
                </p>
                <div className="bg-white rounded-xl p-6 mb-6">
                  <p className="text-lg text-gray-700 mb-4">
                    Love what you see? Complete your masterpiece:
                  </p>
                  <div className="flex items-center justify-center gap-3 text-lg">
                    <Check className="w-6 h-6 text-green-600" />
                    <span>Generate YOUR photo in all 12 legendary art styles</span>
                  </div>
                  <div className="flex items-center justify-center gap-3 text-lg mt-2">
                    <Check className="w-6 h-6 text-green-600" />
                    <span>Professionally printed & bound book</span>
                  </div>
                  <div className="flex items-center justify-center gap-3 text-lg mt-2">
                    <Check className="w-6 h-6 text-green-600" />
                    <span>Shipped directly to your door</span>
                  </div>
                </div>
                <p className="text-sm text-amber-700">
                  Scroll down to personalize and checkout
                </p>
              </div>
            </div>
          )}

          {/* 12 AI-GENERATED IMAGES GRID */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-center mb-6">Your Portrait Gallery</h3>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-6">
              {artists.map((artist, idx) => {
                // In preview mode, show real image for Van Gogh (#6), samples for others
                const isRealImage = isPreviewMode ? idx === 6 : true;
                
                // Map gender to sample image category
                const sampleCategory = selectedGender === 'FemalePet' ? 'pet-female' :
                                      selectedGender === 'MalePet' ? 'pet' :
                                      selectedGender === 'Female' ? 'female' : 'male';
                
                const imageData = isRealImage && selectedVariations[idx] 
                  ? selectedVariations[idx]
                  : { url: sampleImages[sampleCategory][idx] };
                
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      if (isRealImage && selectedVariations[idx]) {
                        setSelectedModalImage({ ...imageData, artist, artistIdx: idx });
                        setShowImageModal(true);
                      }
                    }}
                    className="group relative">
                    <div className="overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition aspect-square bg-gray-100">
                      <img
                        src={imageData.url}
                        alt={artist.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition duration-300"
                        onError={(e) => {
                          // Fallback to a placeholder if sample image doesn't exist yet
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23f3f4f6" width="400" height="400"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="24" fill="%239ca3af"%3ESample%3C/text%3E%3C/svg%3E';
                        }}
                      />
                      {isPreviewMode && idx === 6 && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                          YOUR IMAGE
                        </div>
                      )}
                      {isPreviewMode && idx !== 6 && (
                        <div className="absolute top-2 right-2 bg-gray-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                          SAMPLE
                        </div>
                      )}
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

          {/* FLIPBOOK SECTION - COMPLETE */}
          {(() => {
            const bookPages = [];

            // COVER (NOT COUNTED AS PAGE)
            bookPages.push({
              type: 'front-cover',
              title: 'Front Cover',
              isNotPageNumbered: true,
              content: (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center p-4 relative">
                  <div className="relative w-full h-full max-w-full" style={{ aspectRatio: '19/10.25' }}>
                    <img 
                      src={`/book-pages/${coverColor}-cover.png`}
                      alt="Full Book Cover"
                      className="w-full h-full object-contain"
                      key={coverColor}
                    />
                    <div 
                      className="absolute text-white font-bold text-right"
                      style={{
                        top: '14%',
                        right: '7.5%',
                        width: '33%',
                        fontSize: 'clamp(2.2rem, 4vw, 5.5rem)',
                        lineHeight: '0.95',
                        textShadow: '3px 3px 6px rgba(0,0,0,0.4)',
                        fontFamily: 'serif',
                        letterSpacing: '-0.01em',
                        pointerEvents: 'none'
                      }}>
                      {customerName || 'Your Name'}
                    </div>
                  </div>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      const newName = prompt('Enter name for cover:', customerName || 'Your Name');
                      if (newName !== null && newName.trim()) {
                        const trimmedName = newName.trim();
                        setCustomerName(trimmedName);
                        console.log('🔄 Updating name to:', trimmedName);
                        await saveSession({ customer_name: trimmedName });
                      }
                    }}
                    className="absolute top-4 right-4 flex items-center gap-1 text-pink-700 hover:text-pink-900 text-sm bg-white px-4 py-2 rounded-full shadow-xl z-20 hover:bg-pink-50 transition font-bold border-2 border-pink-200">
                    <Edit2 className="w-4 h-4" />
                    Edit Name
                  </button>
                </div>
              )
            });

            // PAGE 1: Blank
            bookPages.push({
              type: 'blank',
              title: 'Blank Page',
              pageNumber: 1,
              content: (<div className="w-full h-full bg-white"></div>)
            });

            // PAGE 2: Dedication
            bookPages.push({
              type: 'dedication',
              title: 'Dedication',
              pageNumber: 2,
              content: (
                <div className="w-full h-full bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-4 relative">
                  <div className="relative w-full h-full max-w-full" style={{ maxHeight: '100%', aspectRatio: '1/1' }}>
                    <img 
                      src="/book-pages/frame.png"
                      alt="Ornate Frame"
                      className="absolute inset-0 w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 flex items-center justify-center" style={{ padding: '18%' }}>
                      <div className="text-center w-full h-full flex flex-col items-center justify-center overflow-hidden">
                        <button
                          onClick={() => setShowEditDedication(true)}
                          className="absolute top-2 right-2 flex items-center gap-1 text-amber-700 hover:text-amber-900 text-xs bg-white px-2 py-1 rounded-full shadow z-10">
                          <Edit2 className="w-3 h-3" />
                          Edit
                        </button>
                        <p className="text-[0.25rem] sm:text-xs md:text-sm lg:text-base text-gray-700 italic leading-tight sm:leading-snug font-serif whitespace-pre-wrap break-words max-w-full px-1 md:px-2">
                          {dedication || 'Click Edit to add your personal message'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            });

            // PAGE 3: Welcome
            bookPages.push({
              type: 'static',
              title: 'Welcome',
              pageNumber: 3,
              content: (
                <div className="w-full h-full bg-white flex items-center justify-center">
                  <img src="/book-pages/welcome.png" alt="Welcome" className="w-full h-full object-contain" />
                </div>
              )
            });

            // PAGE 4: Table of Contents
            bookPages.push({
              type: 'toc',
              title: 'Table of Contents',
              pageNumber: 4,
              content: (
                <div className="w-full h-full bg-white flex items-center justify-center">
                  <img src="/book-pages/toc.png" alt="TOC" className="w-full h-full object-contain" />
                </div>
              )
            });

            // PAGES 5-28: 12 Artists (2 pages each)
            const artistInfoPages = [
              'davinci-info.png', 'michelangelo-info.png', 'raphael-info.png',
              'rembrandt-info.png', 'vermeer-info.png', 'monet-info.png',
              'vangogh-info.png', 'munch-info.png', 'cubism-info.png',
              'surrealism-info.png', 'popart-info.png', 'americana-info.png'
            ];

            for (let i = 0; i < 12; i++) {
              const artist = artists[i];
              const aiImage = selectedVariations[i];
              
              // In preview mode, use sample images for artists that haven't been generated yet
              const isRealImage = isPreviewMode ? i === 6 : true;
              const sampleCategory = selectedGender === 'FemalePet' ? 'pet-female' :
                                    selectedGender === 'MalePet' ? 'pet' :
                                    selectedGender === 'Female' ? 'female' : 'male';
              
              const imageToShow = isRealImage && aiImage 
                ? aiImage 
                : { url: sampleImages[sampleCategory][i] };
              
              bookPages.push({
                type: 'artwork',
                artistIdx: i,
                title: `${artist.name} Portrait`,
                pageNumber: 5 + (i * 2),
                content: (
                  <div 
                    className="w-full h-full bg-gray-900 flex items-center justify-center p-4 cursor-pointer hover:opacity-95 transition group"
                    onClick={() => {
                      setSelectedModalImage({ ...imageToShow, artist, artistIdx: i });
                      setShowImageModal(true);
                    }}>
                    <div className="relative w-full h-full flex items-center justify-center aspect-square">
                      <img
                        src={imageToShow?.url}
                        alt={artist.name}
                        className="w-full h-full object-contain rounded-lg shadow-2xl"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition flex items-center justify-center">
                        <div className="bg-white/90 px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition">
                          <p className="text-gray-900 font-bold text-sm">Click to enlarge</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              });

              bookPages.push({
                type: 'info',
                artistIdx: i,
                title: `${artist.name} Info`,
                pageNumber: 6 + (i * 2),
                content: (
                  <div className="w-full h-full bg-white flex items-center justify-center">
                    <img 
                      src={`/book-pages/${artistInfoPages[i]}`}
                      alt={`${artist.name} Info`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )
              });
            }

            // PAGE 29: Timeline of Great Masters
            bookPages.push({
              type: 'timeline',
              title: 'Timeline of Great Masters',
              pageNumber: 29,
              content: (
                <div className="w-full h-full bg-white flex items-center justify-center">
                  <img src="/book-pages/timeline.png" alt="Timeline" className="w-full h-full object-contain" />
                </div>
              )
            });

            // PAGE 30: 12-Image Grid Gallery
            bookPages.push({
              type: 'gallery-grid',
              title: 'Your Complete Gallery',
              pageNumber: 30,
              content: (
                <div className="w-full h-full bg-gradient-to-br from-amber-50 to-orange-50 flex flex-col items-center justify-center p-8">
                  <h3 className="text-3xl font-bold text-center mb-6 text-gray-800">Your 12 Masterpiece Portraits</h3>
                  <div className="grid grid-cols-4 grid-rows-3 gap-4 w-full h-[calc(100%-4rem)]">
                    {Object.keys(selectedVariations).map((artistIdx, index) => {
                      const variation = selectedVariations[parseInt(artistIdx)];
                      const artist = artists[parseInt(artistIdx)];
                      return (
                        <div key={index} className="relative bg-white rounded-lg shadow-lg overflow-hidden border-2 border-amber-200">
                          <img 
                            src={variation.url} 
                            alt={artist.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )
            });

            // PAGE 31: Conclusion
            bookPages.push({
              type: 'conclusion',
              title: 'Conclusion',
              pageNumber: 31,
              content: (
                <div className="w-full h-full bg-white flex items-center justify-center">
                  <img src="/book-pages/conclusion.png" alt="Conclusion" className="w-full h-full object-contain" />
                </div>
              )
            });

            // PAGE 32: QR Code
            bookPages.push({
              type: 'qr-code',
              title: 'QR Code',
              pageNumber: 32,
              content: (
                <div className="w-full h-full bg-white flex items-center justify-center">
                  <img src="/book-pages/qr-code.png" alt="QR Code" className="w-full h-full object-contain" />
                </div>
              )
            });

            // BACK COVER (NOT COUNTED AS PAGE)
            bookPages.push({
              type: 'full-cover-back',
              title: 'Back Cover',
              isNotPageNumbered: true,
              content: (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center p-4 relative">
                  <div className="relative w-full h-full max-w-full" style={{ aspectRatio: '19/10.25' }}>
                    <img 
                      src={`/book-pages/${coverColor}-cover.png`}
                      alt="Full Book Cover (Back)"
                      className="w-full h-full object-contain"
                      key={`back-${coverColor}`}
                    />
                    <div 
                      className="absolute text-white font-bold text-right"
                      style={{
                        top: '14%',
                        right: '7.5%',
                        width: '33%',
                        fontSize: 'clamp(2.2rem, 4vw, 5.5rem)',
                        lineHeight: '0.95',
                        textShadow: '3px 3px 6px rgba(0,0,0,0.4)',
                        fontFamily: 'serif',
                        letterSpacing: '-0.01em',
                        pointerEvents: 'none'
                      }}>
                      {customerName || 'Your Name'}
                    </div>
                  </div>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      const newName = prompt('Enter name for cover:', customerName || 'Your Name');
                      if (newName !== null && newName.trim()) {
                        const trimmedName = newName.trim();
                        setCustomerName(trimmedName);
                        console.log('🔄 Updating name to:', trimmedName);
                        await saveSession({ customer_name: trimmedName });
                      }
                    }}
                    className="absolute top-4 right-4 flex items-center gap-1 text-pink-700 hover:text-pink-900 text-sm bg-white px-4 py-2 rounded-full shadow-xl z-20 hover:bg-pink-50 transition font-bold border-2 border-pink-200">
                    <Edit2 className="w-4 h-4" />
                    Edit Name
                  </button>
                </div>
              )
            });

            const totalPages = bookPages.length;
            const totalNumberedPages = bookPages.filter(p => p.pageNumber).length;

            const isFirstPage = currentBookPage === 0;
            const isLastPage = currentBookPage === totalPages - 1;
            
            let leftPage = null;
            let rightPage = null;

            if (isFirstPage) {
              rightPage = bookPages[0];
            } else if (isLastPage) {
              leftPage = bookPages[totalPages - 1];
            } else {
              const isOddIndex = currentBookPage % 2 === 1;
              
              if (isOddIndex) {
                leftPage = bookPages[currentBookPage];
                if (currentBookPage + 1 < totalPages) {
                  rightPage = bookPages[currentBookPage + 1];
                }
              } else {
                leftPage = bookPages[currentBookPage - 1];
                rightPage = bookPages[currentBookPage];
              }
            }

            return (
              <>
                <div className="mb-16">
                  <h3 className="text-3xl font-bold text-center mb-8">📖 Flipbook Preview</h3>
                  <p className="text-center text-gray-600 mb-4">
                    {totalNumberedPages} pages • Navigate with arrows to flip through your book
                  </p>

                  {/* COLOR SELECTOR IN PREVIEW */}
                  <div className="max-w-md mx-auto mb-8 bg-white rounded-2xl p-6 shadow-lg">
                    <label className="block text-lg font-semibold text-gray-700 mb-2 text-center">
                      Choose Your Cover Color
                    </label>
                    <p className="text-xs text-gray-500 text-center mb-3">
                      ✨ Watch the cover change in real-time!
                    </p>
                    <div className="grid grid-cols-4 gap-3">
                      {colorOptions.map((color) => (
                        <button
                          key={color.name}
                          onClick={async () => {
                            setCoverColor(color.name);
                            await saveSession({ cover_color: color.name });
                          }}
                          className={`p-3 rounded-xl border-4 transition ${
                            coverColor === color.name ? 'border-amber-600 scale-105 shadow-lg' : 'border-gray-200'
                          }`}>
                          <div className={`w-full h-12 rounded-lg ${color.bg} mb-1`}></div>
                          <p className="text-xs font-semibold">{color.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="max-w-6xl mx-auto">
                    <div key={currentBookPage} className="bg-gray-100 rounded-3xl shadow-2xl p-8 mb-8">
                      <div className="flex gap-4 justify-center items-stretch">
                        {(currentBookPage === 0 || currentBookPage === totalPages - 1) ? (
                          <div 
                            key={`single-${currentBookPage}`}
                            className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-4xl">
                            {bookPages[currentBookPage].content}
                          </div>
                        ) : (
                          <>
                            {leftPage && (
                              <div 
                                key={`left-${currentBookPage}`}
                                className="bg-white rounded-2xl shadow-xl overflow-hidden flex-1 max-w-md"
                                style={{ aspectRatio: '1/1' }}>
                                {leftPage.content}
                              </div>
                            )}
                            {leftPage && rightPage && (
                              <div className="w-1 bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300 rounded-full"></div>
                            )}
                            {rightPage && (
                              <div 
                                key={`right-${currentBookPage}`}
                                className="bg-white rounded-2xl shadow-xl overflow-hidden flex-1 max-w-md"
                                style={{ aspectRatio: '1/1' }}>
                                {rightPage.content}
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      <div className="text-center mt-6">
                        {isFirstPage && (
                          <>
                            <p className="text-xl font-bold text-gray-800">Front Cover</p>
                            <p className="text-sm text-gray-500 mt-1">Not numbered</p>
                          </>
                        )}
                        {isLastPage && (
                          <>
                            <p className="text-xl font-bold text-gray-800">Back Cover</p>
                            <p className="text-sm text-gray-500 mt-1">Not numbered</p>
                          </>
                        )}
                        {!isFirstPage && !isLastPage && leftPage && rightPage && (
                          <>
                            <p className="text-xl font-bold text-gray-800">
                              Pages {leftPage.pageNumber}-{rightPage.pageNumber}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {leftPage.title} • {rightPage.title}
                            </p>
                          </>
                        )}
                        {!isFirstPage && !isLastPage && ((leftPage && !rightPage) || (!leftPage && rightPage)) && (
                          <>
                            <p className="text-xl font-bold text-gray-800">Page {leftPage?.pageNumber || rightPage?.pageNumber}</p>
                            <p className="text-sm text-gray-500 mt-1">{leftPage?.title || rightPage?.title}</p>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center px-4">
                      <button
                        onClick={() => {
                          if (currentBookPage === 0) return;
                          if (currentBookPage === totalPages - 1) {
                            setCurrentBookPage(totalPages - 3);
                          } else if (currentBookPage <= 2) {
                            setCurrentBookPage(0);
                          } else {
                            setCurrentBookPage(currentBookPage - 2);
                          }
                        }}
                        disabled={currentBookPage === 0}
                        className={`flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg transition ${
                          currentBookPage === 0
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-amber-600 text-white hover:bg-amber-700 shadow-lg hover:shadow-xl'
                        }`}>
                        <ChevronLeft className="w-6 h-6" /> Previous
                      </button>

                      <button
                        onClick={() => {
                          if (currentBookPage === totalPages - 1) return;
                          if (currentBookPage === 0) {
                            setCurrentBookPage(1);
                          } else if (currentBookPage >= totalPages - 3) {
                            setCurrentBookPage(totalPages - 1);
                          } else {
                            setCurrentBookPage(currentBookPage + 2);
                          }
                        }}
                        disabled={currentBookPage === totalPages - 1}
                        className={`flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg transition ${
                          currentBookPage === totalPages - 1
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-amber-600 text-white hover:bg-amber-700 shadow-lg hover:shadow-xl'
                        }`}>
                        Next <ChevronRight className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* IMAGE MODAL WITH "CHANGE THIS IMAGE" BUTTON */}
                {showImageModal && selectedModalImage && (
                  <div
                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 overflow-y-auto"
                    onClick={() => setShowImageModal(false)}>
                    <button
                      onClick={() => setShowImageModal(false)}
                      className="absolute top-4 right-4 bg-white text-gray-900 p-3 rounded-full hover:bg-gray-200 transition z-10">
                      <X className="w-6 h-6" />
                    </button>
                    <div className="max-w-4xl w-full my-8">
                      <img
                        src={selectedModalImage.url}
                        alt={selectedModalImage.artist?.name}
                        className="w-full max-h-[60vh] object-contain rounded-lg shadow-2xl mb-6"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="text-center text-white mb-6">
                        <p className="text-2xl md:text-3xl font-bold">{selectedModalImage.artist?.name}</p>
                        <p className="text-lg md:text-xl text-gray-300 mt-2">{selectedModalImage.artist?.period}</p>
                      </div>
                      {!isPreviewMode && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedArtistForChange(selectedModalImage.artistIdx);
                            setShowArtistModal(true);
                            setShowImageModal(false);
                          }}
                          className="w-full max-w-md mx-auto block bg-amber-600 hover:bg-amber-700 text-white py-4 px-8 rounded-full font-bold text-lg transition">
                          Don't like this image? Click here to change it
                        </button>
                      )}
                      {isPreviewMode && (
                        <div className="text-center text-white bg-amber-900/30 py-3 px-6 rounded-full inline-block">
                          <p className="text-sm text-amber-100">Complete your purchase to customize all images</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ARTIST CHANGE MODAL - SINGLE IMAGE GENERATOR */}
                {showArtistModal && selectedArtistForChange !== null && (
                  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-3xl font-bold">
                          Change {artists[selectedArtistForChange].name} Portrait
                        </h3>
                        <button
                          onClick={() => {
                            setShowArtistModal(false);
                            setSelectedArtistForChange(null);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-full transition">
                          <X className="w-6 h-6" />
                        </button>
                      </div>

                      {isGenerating ? (
                        <div className="text-center py-12">
                          <Loader className="w-16 h-16 text-amber-600 animate-spin mx-auto mb-4" />
                          <p className="text-xl font-bold">Generating new image...</p>
                          <p className="text-sm text-gray-500 mt-2">Cost: $0.15</p>
                        </div>
                      ) : (
                        <>
                          {/* CURRENT IMAGE DISPLAY */}
                          <div className="mb-6">
                            {generatedImages[selectedArtistForChange]?.[0] ? (
                              <div className="relative">
                                <img
                                  src={generatedImages[selectedArtistForChange][0].url}
                                  alt="Current variation"
                                  className="w-full h-auto object-contain rounded-xl shadow-lg"
                                />
                              </div>
                            ) : (
                              <div className="text-center py-12 bg-gray-100 rounded-xl">
                                <p className="text-gray-500">Click "Shuffle" below to generate a new image</p>
                              </div>
                            )}
                          </div>

                          {/* ACTION BUTTONS */}
                          <div className="space-y-4">
                            {/* Shuffle and Select Buttons */}
                            <div className="grid grid-cols-2 gap-4">
                              <button
                                onClick={() => regenerateArtist(selectedArtistForChange)}
                                disabled={isGenerating}
                                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg transition flex items-center justify-center gap-2">
                                🔄 Shuffle
                              </button>
                              
                              <button
                                onClick={() => {
                                  const currentImage = generatedImages[selectedArtistForChange]?.[0];
                                  if (currentImage) {
                                    selectNewVariation(selectedArtistForChange, currentImage);
                                  }
                                }}
                                className="bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold text-lg transition flex items-center justify-center gap-2">
                                <Check className="w-5 h-5" />
                                Use This Image
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* DEDICATION EDIT MODAL */}
                {showEditDedication && (
                  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl md:text-2xl font-bold">Edit Dedication</h3>
                        <button
                          onClick={() => setShowEditDedication(false)}
                          className="p-2 hover:bg-gray-100 rounded-full">
                          <X className="w-6 h-6" />
                        </button>
                      </div>

                      <textarea
                        value={editedDedication}
                        onChange={(e) => {
                          if (e.target.value.length <= 300) {
                            setEditedDedication(e.target.value);
                          }
                        }}
                        placeholder="Enter your dedication message..."
                        maxLength={300}
                        rows={6}
                        className="w-full px-4 md:px-6 py-3 md:py-4 border-2 border-gray-300 rounded-xl focus:border-amber-600 focus:outline-none resize-none mb-2"
                      />
                      <p className="text-right text-sm text-gray-500 mb-6">
                        {editedDedication.length}/300 characters
                      </p>

                      <div className="flex flex-col md:flex-row gap-4">
                        <button
                          onClick={() => setShowEditDedication(false)}
                          className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-full font-bold hover:bg-gray-300 transition">
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveDedication}
                          className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-600 to-red-600 text-white rounded-full font-bold hover:shadow-xl transition">
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Cover Type Selector - Only show before payment */}
                {paymentStatus !== 'paid' && (
                  <CoverTypeSelector 
                    selectedCover={coverType}
                    onCoverChange={handleCoverChange}
                  />
                )}

                <div className="max-w-md mx-auto bg-white rounded-3xl p-6 md:p-8 shadow-xl">
                  <h3 className="text-xl md:text-2xl font-bold mb-6 text-center">Order Summary</h3>
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between py-3 border-b">
                      <span>{coverType === 'softcover' ? 'Softcover' : 'Hardcover'} Book</span>
                      <span className="font-bold">${price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-3">
                      <span>Shipping</span>
                      <span className="text-green-600 font-semibold">FREE</span>
                    </div>
                    <div className="flex justify-between py-4 bg-amber-50 rounded-xl px-4">
                      <span className="font-bold">Total</span>
                      <span className="text-2xl font-bold text-amber-600">${price.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  {/* Show different button based on payment status */}
                  {paymentStatus === 'paid' ? (
                    <>
                      <button
                        onClick={handleConfirmOrder}
                        disabled={isSubmittingOrder}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-4 rounded-full font-bold text-xl shadow-xl transition flex items-center justify-center gap-2">
                        {isSubmittingOrder ? (
                          <>
                            <Loader className="w-5 h-5 animate-spin" />
                            Processing Order...
                          </>
                        ) : (
                          <>
                            <Check className="w-5 h-5" />
                            Confirm & Place Order
                          </>
                        )}
                      </button>
                      {isSubmittingOrder && (
                        <div className="mt-4 text-center">
                          <p className="text-sm text-gray-600">
                            ⏳ Your book is being prepared for printing...<br/>
                            <span className="text-green-600 font-semibold">This will only take a moment!</span>
                          </p>
                        </div>
                      )}
                      <p className="text-center text-sm text-amber-700 mt-3 font-semibold">
                        ⚠️ Please don't refresh the page while placing your order
                      </p>
                    </>
                  ) : (
                    <button
                      onClick={handleCheckout}
                      className="w-full bg-gradient-to-r from-amber-600 to-red-600 text-white py-4 rounded-full font-bold hover:shadow-xl transition">
                      {isPreviewMode ? 'Complete Your Masterpiece →' : 'Proceed to Secure Checkout →'}
                    </button>
                  )}
                  
                  {isPreviewMode && paymentStatus !== 'paid' && (
                    <p className="text-xs text-gray-500 text-center mt-3">
                      After payment, we'll generate YOUR photo in all 12 artist styles
                    </p>
                  )}
                  
                  {paymentStatus === 'paid' && (
                    <p className="text-xs text-green-600 text-center mt-3 font-medium">
                      ✅ Payment received! Review your images above, then confirm to place your order.
                    </p>
                  )}
                </div>
              </>
            );
          })()}
        </section>
      )}

      {/* GENERATING FINAL 11 IMAGES AFTER PAYMENT */}
      {currentStep === 'generating-final' && (
        <section className="max-w-3xl mx-auto px-4 py-20">
          <div className="bg-white rounded-3xl p-12 shadow-xl text-center">
            <div className="w-24 h-24 mx-auto mb-8">
              <Loader className="w-full h-full text-amber-600 animate-spin" />
            </div>

            <h2 className="text-4xl font-bold mb-4">🎨 Creating Your Masterpiece!</h2>
            <p className="text-xl text-gray-600 mb-8">
              Payment confirmed! Now generating YOUR portraits in all 12 legendary art styles...
            </p>

            {/* REAL PROGRESS BAR */}
            <div className="mb-6">
              <div className="bg-gray-200 rounded-full h-6 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-red-500 h-full transition-all duration-500 flex items-center justify-center text-white text-sm font-bold"
                  style={{ width: `${batchProgress}%` }}>
                  {batchProgress > 10 && `${Math.round(batchProgress)}%`}
                </div>
              </div>
            </div>

            {/* TIMER COUNTDOWN */}
            <p className="text-lg text-gray-500">
              Estimated time remaining: <span className="font-bold text-amber-600">
                {Math.max(0, Math.ceil((90 - (batchProgress / 100) * 90)))}s
              </span>
            </p>

            <div className="mt-8 text-sm text-gray-400">
              <p>💡 Generating remaining 11 portraits in parallel</p>
              <p className="mt-2">This typically takes 60-90 seconds</p>
            </div>
          </div>
        </section>
      )}

      {/* SUCCESS STEP */}
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
              <p className="text-sm text-gray-500">Contact us at support@buildabook.store</p>
            </div>

            <button 
              onClick={() => { 
                setCurrentStep('home'); 
                setUploadedImage(null);
                setSessionId(null);
                setCustomerName('');
                setDedication('');
                setEditedDedication('');
                window.history.pushState({}, '', '/'); 
              }} 
              className="mt-8 bg-gradient-to-r from-amber-600 to-red-600 text-white px-12 py-4 rounded-full font-bold hover:shadow-xl transition">
              Create Another Book
            </button>
          </div>

          {/* ADD FLIPBOOK PREVIEW ON SUCCESS PAGE */}
          {Object.keys(selectedVariations).length === 12 && (
            <div className="mt-16">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold mb-4">📖 Your Completed Book</h2>
                <p className="text-gray-600">Browse through your personalized masterpiece</p>
              </div>

              {/* Reuse the same flipbook logic from preview page */}
              {(() => {
                const bookPages = [];

                // FRONT COVER
                bookPages.push({
                  type: 'front-cover',
                  title: 'Front Cover',
                  isNotPageNumbered: true,
                  content: (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center p-4">
                      <div className="relative w-full h-full max-w-full" style={{ aspectRatio: '19/10.25' }}>
                        <img 
                          src={`/book-pages/${coverColor}-cover.png`}
                          alt="Book Cover"
                          className="w-full h-full object-contain"
                        />
                        <div 
                          className="absolute text-white font-bold text-right"
                          style={{
                            top: '14%',
                            right: '7.5%',
                            width: '33%',
                            fontSize: 'clamp(2.2rem, 4vw, 5.5rem)',
                            lineHeight: '0.95',
                            textShadow: '3px 3px 6px rgba(0,0,0,0.4)',
                            fontFamily: 'serif',
                            pointerEvents: 'none'
                          }}>
                          {customerName || 'Your Name'}
                        </div>
                      </div>
                    </div>
                  )
                });

                // PAGE 1: Blank
                bookPages.push({
                  type: 'blank',
                  title: 'Blank Page',
                  pageNumber: 1,
                  content: (<div className="w-full h-full bg-white"></div>)
                });

                // PAGE 2: Dedication
                bookPages.push({
                  type: 'dedication',
                  title: 'Dedication',
                  pageNumber: 2,
                  content: (
                    <div className="w-full h-full bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-4">
                      <div className="relative w-full h-full max-w-full aspect-square">
                        <img 
                          src="/book-pages/frame.png"
                          alt="Ornate Frame"
                          className="absolute inset-0 w-full h-full object-contain"
                        />
                        <div className="absolute inset-0 flex items-center justify-center" style={{ padding: '18%' }}>
                          <div className="text-center">
                            <p className="text-sm md:text-base text-gray-700 italic font-serif whitespace-pre-wrap">
                              {dedication || 'Your dedication here'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                });

                // Add all interior pages (welcome, TOC, artists, timeline, gallery, conclusion, QR)
                const interiorPages = [
                  { type: 'static', title: 'Welcome', pageNumber: 3, img: 'welcome.png' },
                  { type: 'toc', title: 'Table of Contents', pageNumber: 4, img: 'toc.png' }
                ];

                interiorPages.forEach(page => {
                  bookPages.push({
                    ...page,
                    content: (
                      <div className="w-full h-full bg-white flex items-center justify-center">
                        <img src={`/book-pages/${page.img}`} alt={page.title} className="w-full h-full object-contain" />
                      </div>
                    )
                  });
                });

                // 12 Artists with portraits + info pages
                const artistInfoPages = [
                  'davinci-info.png', 'michelangelo-info.png', 'raphael-info.png',
                  'rembrandt-info.png', 'vermeer-info.png', 'monet-info.png',
                  'vangogh-info.png', 'munch-info.png', 'cubism-info.png',
                  'surrealism-info.png', 'popart-info.png', 'americana-info.png'
                ];

                for (let i = 0; i < 12; i++) {
                  const artist = artists[i];
                  const aiImage = selectedVariations[i];

                  // AI Portrait
                  bookPages.push({
                    type: 'artwork',
                    artistIdx: i,
                    title: `${artist.name} Portrait`,
                    pageNumber: 5 + (i * 2),
                    content: (
                      <div className="w-full h-full bg-gray-900 flex items-center justify-center p-4">
                        <img
                          src={aiImage?.url}
                          alt={artist.name}
                          className="w-full h-full object-contain rounded-lg shadow-2xl"
                        />
                      </div>
                    )
                  });

                  // Info page
                  bookPages.push({
                    type: 'info',
                    title: `${artist.name} Info`,
                    pageNumber: 6 + (i * 2),
                    content: (
                      <div className="w-full h-full bg-white flex items-center justify-center">
                        <img 
                          src={`/book-pages/${artistInfoPages[i]}`}
                          alt={`${artist.name} Info`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )
                  });
                }

                // Timeline, Gallery, Conclusion, QR
                bookPages.push({
                  type: 'timeline',
                  title: 'Timeline',
                  pageNumber: 29,
                  content: (
                    <div className="w-full h-full bg-white flex items-center justify-center">
                      <img src="/book-pages/timeline.png" alt="Timeline" className="w-full h-full object-contain" />
                    </div>
                  )
                });

                bookPages.push({
                  type: 'gallery-grid',
                  title: 'Gallery',
                  pageNumber: 30,
                  content: (
                    <div className="w-full h-full bg-gradient-to-br from-amber-50 to-orange-50 flex flex-col items-center justify-center p-8">
                      <h3 className="text-3xl font-bold text-center mb-6 text-gray-800">Your 12 Masterpiece Portraits</h3>
                      <div className="grid grid-cols-4 grid-rows-3 gap-4 w-full h-[calc(100%-4rem)]">
                        {artists.map((artist, index) => {
                          const img = selectedVariations[index];
                          return (
                            <div key={index} className="relative bg-white rounded-lg shadow-lg overflow-hidden border-2 border-amber-200">
                              <img 
                                src={img?.url}
                                alt={artist.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )
                });

                bookPages.push({
                  type: 'conclusion',
                  title: 'Conclusion',
                  pageNumber: 31,
                  content: (
                    <div className="w-full h-full bg-white flex items-center justify-center">
                      <img src="/book-pages/conclusion.png" alt="Conclusion" className="w-full h-full object-contain" />
                    </div>
                  )
                });

                bookPages.push({
                  type: 'qr-code',
                  title: 'QR Code',
                  pageNumber: 32,
                  content: (
                    <div className="w-full h-full bg-white flex items-center justify-center">
                      <img src="/book-pages/qr-code.png" alt="QR Code" className="w-full h-full object-contain" />
                    </div>
                  )
                });

                // BACK COVER
                bookPages.push({
                  type: 'back-cover',
                  title: 'Back Cover',
                  isNotPageNumbered: true,
                  content: (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center p-4">
                      <div className="relative w-full h-full max-w-full" style={{ aspectRatio: '19/10.25' }}>
                        <img 
                          src={`/book-pages/${coverColor}-cover.png`}
                          alt="Back Cover"
                          className="w-full h-full object-contain"
                        />
                        <div 
                          className="absolute text-white font-bold text-right"
                          style={{
                            top: '14%',
                            right: '7.5%',
                            width: '33%',
                            fontSize: 'clamp(2.2rem, 4vw, 5.5rem)',
                            lineHeight: '0.95',
                            textShadow: '3px 3px 6px rgba(0,0,0,0.4)',
                            fontFamily: 'serif',
                            pointerEvents: 'none'
                          }}>
                          {customerName || 'Your Name'}
                        </div>
                      </div>
                    </div>
                  )
                });

                const totalPages = bookPages.length;
                const isFirstPage = currentBookPage === 0;
                const isLastPage = currentBookPage === totalPages - 1;

                let leftPage = null;
                let rightPage = null;

                if (isFirstPage) {
                  rightPage = bookPages[0];
                } else if (isLastPage) {
                  leftPage = bookPages[totalPages - 1];
                } else {
                  const isOddIndex = currentBookPage % 2 === 1;
                  if (isOddIndex) {
                    leftPage = bookPages[currentBookPage];
                    if (currentBookPage + 1 < totalPages) {
                      rightPage = bookPages[currentBookPage + 1];
                    }
                  } else {
                    leftPage = bookPages[currentBookPage - 1];
                    rightPage = bookPages[currentBookPage];
                  }
                }

                return (
                  <>
                    <div key={currentBookPage} className="bg-gray-100 rounded-3xl shadow-2xl p-8 mb-8">
                      <div className="flex gap-4 justify-center items-stretch">
                        {(currentBookPage === 0 || currentBookPage === totalPages - 1) ? (
                          <div 
                            key={`single-${currentBookPage}`}
                            className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-4xl">
                            {bookPages[currentBookPage].content}
                          </div>
                        ) : (
                          <>
                            {leftPage && (
                              <div 
                                key={`left-${currentBookPage}`}
                                className="bg-white rounded-2xl shadow-xl overflow-hidden flex-1 max-w-md"
                                style={{ aspectRatio: '1/1' }}>
                                {leftPage.content}
                              </div>
                            )}
                            {leftPage && rightPage && (
                              <div className="w-1 bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300 rounded-full"></div>
                            )}
                            {rightPage && (
                              <div 
                                key={`right-${currentBookPage}`}
                                className="bg-white rounded-2xl shadow-xl overflow-hidden flex-1 max-w-md"
                                style={{ aspectRatio: '1/1' }}>
                                {rightPage.content}
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      <div className="text-center mt-6">
                        {isFirstPage && <p className="text-xl font-bold text-gray-800">Front Cover</p>}
                        {isLastPage && <p className="text-xl font-bold text-gray-800">Back Cover</p>}
                        {!isFirstPage && !isLastPage && leftPage && rightPage && (
                          <p className="text-xl font-bold text-gray-800">{leftPage.title} • {rightPage.title}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center px-4">
                      <button
                        onClick={() => {
                          if (currentBookPage === 0) return;
                          if (currentBookPage <= 2) {
                            setCurrentBookPage(0);
                          } else {
                            setCurrentBookPage(currentBookPage - 2);
                          }
                        }}
                        disabled={currentBookPage === 0}
                        className={`flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg transition ${
                          currentBookPage === 0
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-amber-600 text-white hover:bg-amber-700 shadow-lg'
                        }`}>
                        <ChevronLeft className="w-6 h-6" /> Previous
                      </button>

                      <button
                        onClick={() => {
                          if (currentBookPage === totalPages - 1) return;
                          if (currentBookPage === 0) {
                            setCurrentBookPage(1);
                          } else {
                            setCurrentBookPage(Math.min(totalPages - 1, currentBookPage + 2));
                          }
                        }}
                        disabled={currentBookPage === totalPages - 1}
                        className={`flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg transition ${
                          currentBookPage === totalPages - 1
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-amber-600 text-white hover:bg-amber-700 shadow-lg'
                        }`}>
                        Next <ChevronRight className="w-6 h-6" />
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </section>
      )}

      {/* SAMPLE BOOK BROWSER MODAL */}
      {showSampleBrowser && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-2 md:p-4 overflow-y-auto"
          onClick={() => {
            setShowSampleBrowser(false);
            setCurrentSampleBookPage(0);
          }}
        >
          <div 
            className="bg-white rounded-3xl p-4 md:p-8 max-w-6xl w-full max-h-[95vh] overflow-y-auto my-4 md:my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4 md:mb-8">
              <div>
                <h2 className="text-2xl md:text-4xl font-bold mb-1 md:mb-2">
                  {currentSampleBook === 'male' ? '👨 Male' : currentSampleBook === 'female' ? '👩 Female' : '🐕 Pet'} Sample Book
                </h2>
                <p className="text-sm md:text-base text-gray-600">Browse the complete 32-page flipbook</p>
              </div>
              <button
                onClick={() => {
                  setShowSampleBrowser(false);
                  setCurrentSampleBookPage(0);
                }}
                className="p-2 md:p-3 hover:bg-gray-100 rounded-full transition">
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>

            {/* COLOR SELECTOR FOR SAMPLE - MOBILE OPTIMIZED */}
            <div className="max-w-md mx-auto mb-4 md:mb-8 bg-gray-50 rounded-2xl p-3 md:p-6">
              <label className="block text-base md:text-lg font-semibold text-gray-700 mb-2 text-center">
                Choose Cover Color
              </label>
              <div className="grid grid-cols-5 gap-2 md:gap-3">
                {colorOptions.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSampleBookColor(color.name)}
                    className={`p-2 md:p-3 rounded-xl border-2 md:border-4 transition ${
                      sampleBookColor === color.name ? 'border-amber-600 scale-105 shadow-lg' : 'border-gray-200'
                    }`}>
                    <div className={`w-full h-8 md:h-12 rounded-lg ${color.bg} mb-1`}></div>
                    <p className="text-[10px] md:text-xs font-semibold">{color.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* SIMPLIFIED FLIPBOOK - MOBILE OPTIMIZED */}
            <div className="mb-4 md:mb-8">
              {(() => {
                const sampleBookPages = [];
                
                // FRONT COVER (NOT COUNTED AS PAGE)
                sampleBookPages.push({
                  type: 'front-cover',
                  title: 'Front Cover',
                  isNotPageNumbered: true,
                  content: (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center p-4">
                      <div className="relative w-full h-full max-w-full" style={{ aspectRatio: '19/10.25' }}>
                        <img 
                          src={`/book-pages/${sampleBookColor}-cover.png`}
                          alt="Sample Book Cover"
                          className="w-full h-full object-contain"
                        />
                        <div 
                          className="absolute text-white font-bold text-right"
                          style={{
                            top: '14%',
                            right: '7.5%',
                            width: '33%',
                            fontSize: 'clamp(2.2rem, 4vw, 5.5rem)',
                            lineHeight: '0.95',
                            textShadow: '3px 3px 6px rgba(0,0,0,0.4)',
                            fontFamily: 'serif',
                            pointerEvents: 'none'
                          }}>
                          Name
                        </div>
                      </div>
                    </div>
                  )
                });

                // PAGE 1: Blank
                sampleBookPages.push({
                  type: 'blank',
                  title: 'Blank Page',
                  pageNumber: 1,
                  content: (<div className="w-full h-full bg-white"></div>)
                });

                // PAGE 2: Dedication
                sampleBookPages.push({
                  type: 'dedication',
                  title: 'Dedication',
                  pageNumber: 2,
                  content: (
                    <div className="w-full h-full bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-4">
                      <div className="relative w-full h-full max-w-full aspect-square">
                        <img 
                          src="/book-pages/frame.png"
                          alt="Ornate Frame"
                          className="absolute inset-0 w-full h-full object-contain"
                        />
                        <div className="absolute inset-0 flex items-center justify-center" style={{ padding: '18%' }}>
                          <div className="text-center">
                            <p className="text-sm md:text-base text-gray-700 italic font-serif">
                              Dedication text goes here
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                });

                // PAGE 3: Welcome
                sampleBookPages.push({
                  type: 'static',
                  title: 'Welcome',
                  pageNumber: 3,
                  content: (
                    <div className="w-full h-full bg-white flex items-center justify-center">
                      <img src="/book-pages/welcome.png" alt="Welcome" className="w-full h-full object-contain" />
                    </div>
                  )
                });

                // PAGE 4: Table of Contents
                sampleBookPages.push({
                  type: 'toc',
                  title: 'Table of Contents',
                  pageNumber: 4,
                  content: (
                    <div className="w-full h-full bg-white flex items-center justify-center">
                      <img src="/book-pages/toc.png" alt="TOC" className="w-full h-full object-contain" />
                    </div>
                  )
                });

                // PAGES 5-28: 12 Artists (AI portrait + Info page each)
                const artistInfoPages = [
                  'davinci-info.png', 'michelangelo-info.png', 'raphael-info.png',
                  'rembrandt-info.png', 'vermeer-info.png', 'monet-info.png',
                  'vangogh-info.png', 'munch-info.png', 'cubism-info.png',
                  'surrealism-info.png', 'popart-info.png', 'americana-info.png'
                ];

                for (let i = 0; i < 12; i++) {
                  const artist = artists[i];
                  
                  // AI Portrait page
                  sampleBookPages.push({
                    type: 'artwork',
                    artistIdx: i,
                    title: `${artist.name} Portrait`,
                    pageNumber: 5 + (i * 2),
                    content: (
                      <div className="w-full h-full bg-gray-900 flex items-center justify-center p-4">
                        <img
                          src={`/samples/${currentSampleBook}/${artistFilenames[artist.name]}.jpg`}
                          alt={artist.name}
                          className="w-full h-full object-contain rounded-lg shadow-2xl"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23f3f4f6" width="400" height="400"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="18" fill="%239ca3af"%3ESample%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      </div>
                    )
                  });

                  // Info page
                  sampleBookPages.push({
                    type: 'info',
                    artistIdx: i,
                    title: `${artist.name} Info`,
                    pageNumber: 6 + (i * 2),
                    content: (
                      <div className="w-full h-full bg-white flex items-center justify-center">
                        <img 
                          src={`/book-pages/${artistInfoPages[i]}`}
                          alt={`${artist.name} Info`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )
                  });
                }

                // PAGE 29: Timeline
                sampleBookPages.push({
                  type: 'timeline',
                  title: 'Timeline of Great Masters',
                  pageNumber: 29,
                  content: (
                    <div className="w-full h-full bg-white flex items-center justify-center">
                      <img src="/book-pages/timeline.png" alt="Timeline" className="w-full h-full object-contain" />
                    </div>
                  )
                });

                // PAGE 30: Gallery Grid
                sampleBookPages.push({
                  type: 'gallery-grid',
                  title: 'Complete Gallery',
                  pageNumber: 30,
                  content: (
                    <div className="w-full h-full bg-gradient-to-br from-amber-50 to-orange-50 flex flex-col items-center justify-center p-8">
                      <h3 className="text-3xl font-bold text-center mb-6 text-gray-800">Your 12 Masterpiece Portraits</h3>
                      <div className="grid grid-cols-4 grid-rows-3 gap-4 w-full h-[calc(100%-4rem)]">
                        {artists.map((artist, index) => (
                          <div key={index} className="relative bg-white rounded-lg shadow-lg overflow-hidden border-2 border-amber-200">
                            <img 
                              src={`/samples/${currentSampleBook}/${artistFilenames[artist.name]}.jpg`}
                              alt={artist.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23f3f4f6" width="400" height="400"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="18" fill="%239ca3af"%3ESample%3C/text%3E%3C/svg%3E';
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                });

                // PAGE 31: Conclusion
                sampleBookPages.push({
                  type: 'conclusion',
                  title: 'Conclusion',
                  pageNumber: 31,
                  content: (
                    <div className="w-full h-full bg-white flex items-center justify-center">
                      <img src="/book-pages/conclusion.png" alt="Conclusion" className="w-full h-full object-contain" />
                    </div>
                  )
                });

                // PAGE 32: QR Code
                sampleBookPages.push({
                  type: 'qr-code',
                  title: 'QR Code',
                  pageNumber: 32,
                  content: (
                    <div className="w-full h-full bg-white flex items-center justify-center">
                      <img src="/book-pages/qr-code.png" alt="QR Code" className="w-full h-full object-contain" />
                    </div>
                  )
                });

                // BACK COVER (NOT COUNTED AS PAGE)
                sampleBookPages.push({
                  type: 'back-cover',
                  title: 'Back Cover',
                  isNotPageNumbered: true,
                  content: (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center p-4">
                      <div className="relative w-full h-full max-w-full" style={{ aspectRatio: '19/10.25' }}>
                        <img 
                          src={`/book-pages/${sampleBookColor}-cover.png`}
                          alt="Sample Back Cover"
                          className="w-full h-full object-contain"
                        />
                        <div 
                          className="absolute text-white font-bold text-right"
                          style={{
                            top: '14%',
                            right: '7.5%',
                            width: '33%',
                            fontSize: 'clamp(2.2rem, 4vw, 5.5rem)',
                            lineHeight: '0.95',
                            textShadow: '3px 3px 6px rgba(0,0,0,0.4)',
                            fontFamily: 'serif',
                            pointerEvents: 'none'
                          }}>
                          Name
                        </div>
                      </div>
                    </div>
                  )
                });

                const totalPages = sampleBookPages.length;
                const isFirstPage = currentSampleBookPage === 0;
                const isLastPage = currentSampleBookPage === totalPages - 1;
                
                let leftPage = null;
                let rightPage = null;

                if (isFirstPage) {
                  rightPage = sampleBookPages[0];
                } else if (isLastPage) {
                  leftPage = sampleBookPages[totalPages - 1];
                } else {
                  const isOddIndex = currentSampleBookPage % 2 === 1;
                  if (isOddIndex) {
                    leftPage = sampleBookPages[currentSampleBookPage];
                    if (currentSampleBookPage + 1 < totalPages) {
                      rightPage = sampleBookPages[currentSampleBookPage + 1];
                    }
                  } else {
                    leftPage = sampleBookPages[currentSampleBookPage - 1];
                    rightPage = sampleBookPages[currentSampleBookPage];
                  }
                }

                return (
                  <>
                    <div key={currentSampleBookPage} className="bg-gray-100 rounded-2xl md:rounded-3xl shadow-2xl p-3 md:p-8 mb-4 md:mb-8">
                      <div className="flex gap-2 md:gap-4 justify-center items-stretch">
                        {(currentSampleBookPage === 0 || currentSampleBookPage === totalPages - 1) ? (
                          <div key={`single-${currentSampleBookPage}`} className="bg-white rounded-xl md:rounded-2xl shadow-xl overflow-hidden w-full max-w-full md:max-w-4xl" style={{ aspectRatio: currentSampleBookPage === 0 ? '19/10.25' : '1/1' }}>
                            {sampleBookPages[currentSampleBookPage].content}
                          </div>
                        ) : (
                          <>
                            {leftPage && (
                              <div key={`left-${currentSampleBookPage}`} className="bg-white rounded-xl md:rounded-2xl shadow-xl overflow-hidden flex-1 max-w-full md:max-w-md" style={{ aspectRatio: '1/1' }}>
                                {leftPage.content}
                              </div>
                            )}
                            {leftPage && rightPage && (
                              <div className="w-0.5 md:w-1 bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300 rounded-full"></div>
                            )}
                            {rightPage && (
                              <div key={`right-${currentSampleBookPage}`} className="bg-white rounded-xl md:rounded-2xl shadow-xl overflow-hidden flex-1 max-w-full md:max-w-md" style={{ aspectRatio: '1/1' }}>
                                {rightPage.content}
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      <div className="text-center mt-3 md:mt-6">
                        {isFirstPage && <p className="text-base md:text-xl font-bold text-gray-800">Front Cover</p>}
                        {!isFirstPage && !isLastPage && leftPage && rightPage && (
                          <p className="text-sm md:text-xl font-bold text-gray-800">{leftPage.title} • {rightPage.title}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center px-2 md:px-4 mb-4 md:mb-8">
                      <button
                        onClick={() => {
                          if (currentSampleBookPage === 0) return;
                          if (currentSampleBookPage <= 2) {
                            setCurrentSampleBookPage(0);
                          } else {
                            setCurrentSampleBookPage(currentSampleBookPage - 2);
                          }
                        }}
                        disabled={currentSampleBookPage === 0}
                        className={`flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg transition ${
                          currentSampleBookPage === 0
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-amber-600 text-white hover:bg-amber-700 shadow-lg'
                        }`}>
                        <ChevronLeft className="w-6 h-6" /> Previous
                      </button>

                      <button
                        onClick={() => {
                          if (currentSampleBookPage === totalPages - 1) return;
                          if (currentSampleBookPage === 0) {
                            setCurrentSampleBookPage(1);
                          } else {
                            setCurrentSampleBookPage(Math.min(totalPages - 1, currentSampleBookPage + 2));
                          }
                        }}
                        disabled={currentSampleBookPage === totalPages - 1}
                        className={`flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg transition ${
                          currentSampleBookPage === totalPages - 1
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-amber-600 text-white hover:bg-amber-700 shadow-lg'
                        }`}>
                        Next <ChevronRight className="w-6 h-6" />
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-4 border-amber-400 rounded-2xl p-6 mb-6">
              <p className="text-center text-lg font-bold text-amber-900 mb-3">
                Love what you see?
              </p>
              <p className="text-center text-amber-800 mb-4">
                Create your own personalized book with YOUR photo for just $39.99 - $49.99
              </p>
              <button
                onClick={() => {
                  setShowSampleBrowser(false);
                  // Scroll to upload section
                  setTimeout(() => {
                    const uploadSection = document.getElementById('upload-section');
                    if (uploadSection) {
                      uploadSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }, 100);
                }}
                className="w-full bg-gradient-to-r from-amber-600 to-red-600 text-white py-4 px-8 rounded-full font-bold text-lg hover:shadow-xl transition">
                Create Your Own Book →
              </button>
            </div>

            <div className="text-center">
              <button
                onClick={() => setShowSampleBrowser(false)}
                className="text-gray-500 hover:text-gray-700 underline">
                Close Sample Book
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <span className="text-2xl">🎨</span>
          <p className="text-xl font-bold mt-2">BuildaBook</p>
          <p className="text-gray-400 mt-2">Turn photos into timeless art</p>
        </div>
      </footer>
    </div>
  );
}