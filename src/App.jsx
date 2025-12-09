import React, { useState, useEffect, useRef } from 'react';
import { Upload, ArrowRight, Check, Loader, Copy, Home, Undo, Redo, Clock, ChevronLeft, ChevronRight, X, Mail, Phone, Edit2 } from 'lucide-react';
import { Turnstile } from '@marsidev/react-turnstile';
import CoverTypeSelector from './components/CoverTypeSelector';

const BACKEND_URL = 'https://cartoonme-backend.onrender.com';
const CLOUDFLARE_SITE_KEY = '0x4AAAAAAB6No5gcHaleduBl';

export default function MasterpieceMe() {
  const [currentStep, setCurrentStep] = useState('home');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [coverType, setCoverType] = useState('hardcover');
  const [coverColor, setCoverColor] = useState('pink');
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
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  const [estimatedTimeLeft, setEstimatedTimeLeft] = useState(40);
  const [isSessionLoading, setIsSessionLoading] = useState(false);
  const [orderNumber, setOrderNumber] = useState(null);
  const [currentBookPage, setCurrentBookPage] = useState(0);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [verificationStep, setVerificationStep] = useState('input');
  const [contactMethod, setContactMethod] = useState('email');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [contactValue, setContactValue] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [dedication, setDedication] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedModalImage, setSelectedModalImage] = useState(null);
  const [showEditDedication, setShowEditDedication] = useState(false);
  const [editedDedication, setEditedDedication] = useState('');
  const [showArtistModal, setShowArtistModal] = useState(false);
  const [selectedArtistForChange, setSelectedArtistForChange] = useState(null);
  const codeInputRefs = useRef([]);

  const colorOptions = [
    { name: 'pink', bg: 'bg-pink-500', label: 'Hot Pink' },
    { name: 'teal', bg: 'bg-teal-500', label: 'Teal' },
    { name: 'blue', bg: 'bg-blue-500', label: 'Bright Blue' },
    { name: 'gray', bg: 'bg-gray-700', label: 'Dark Gray' }
  ];

  const artists = [
    { 
      name: 'Leonardo da Vinci', 
      period: 'Renaissance',
      malePrompt: 'Renaissance portrait characterized by masterful sfumato and divine serenity. Masculine figure in three-quarter view with solemn blessed expression, one hand raised with two fingers extended in gesture of benediction, the other hand holding crystalline orb. Refined noble features with contemplative gaze. Rich blue robes with intricate gold embroidery and red undergarment visible. Warm golden-brown atmospheric tones, luminous skin rendered with delicate glazing. Dark background with subtle gradations, imperceptible brushwork creating smooth transitions. Capturing spiritual authority and Renaissance ideals of human divinity through anatomical precision and psychological depth. Preserve original eyewear if present, do not add or remove glasses. Maintain original facial hair style exactly as it appears, do not add or remove facial hair. Maintain original hair length exactly as it appears.',
      femalePrompt: 'Renaissance portrait featuring a single feminine subject with soft delicate sfumato technique, subtle enigmatic smile with mysterious knowing expression. Warm golden-brown earth tones, hands delicately folded or crossed in contemplative pose. Misty atmospheric landscape background with winding paths and distant mountains, three-quarter view revealing elegant posture. Oil painting with imperceptibly smooth transitions and invisible brushstrokes, dark draped dress with fine pleating details. Veil or translucent head covering, luminous porcelain skin tones with delicate glazes. Contemplative timeless mood capturing inner grace, psychological depth, and sophisticated Renaissance femininity. Only one female figure present in composition. Preserve original eyewear if present, do not add or remove glasses. Maintain original hair length exactly as it appears.',
      petPrompt: 'Renaissance portrait of a pet (dog, cat, bird, or reptile) in a noble, serene pose, rendered with masterful sfumato. The pet has an enigmatic, almost human-like expression and is adorned with a delicate Renaissance-style collar or small jeweled pendant. A misty, atmospheric landscape with winding paths and distant mountains forms the background. The fur/feathers/scales are depicted with luminous, soft transitions and meticulous detail, capturing the pet\'s inner grace and dignity. Oil painting with imperceptible brushstrokes, warm golden-brown earth tones, and delicate glazing. The pet should embody Renaissance ideals of elegance and contemplation.'
    },
    { 
      name: 'Michelangelo', 
      period: 'Renaissance',
      malePrompt: 'Create a full-body marble statue of the man from the original image, in a classical pose, located in a grand museum hall. The statue, including the head, should be made of white marble and faithfully retain his facial features, including his glasses if present, his beard/stubble, and his hairstyle. He should be adorned with simple, draped classical robes covering his lower body, leaving his chest and arms exposed. The lighting should evoke a serene museum atmosphere, highlighting the marble texture and form.',
      femalePrompt: 'Renaissance portrait with idealized feminine beauty in sacred monumental style, powerful graceful features with classical proportions and sculptural presence. Flowing robes and gathered drapery in rich earth tones of terracotta, deep azure blues, warm ochres, and sage greens. Surrounded by celestial elements - soft-winged cherubic putti, swirling heavenly clouds, painted architectural framework with coffered vaults. Seated or reclining pose with turned contrapposto torso, one arm extended in graceful gesture. Strong chiaroscuro creates dramatic divine illumination, expression blending tender maternal warmth with spiritual authority. Monumental fresco-like composition with vibrant colors and bold sculptural forms. Only one female figure present in composition. Preserve original eyewear if present, do not add or remove glasses. Maintain original hair length exactly as it appears.',
      petPrompt: 'A majestic full-body marble statue of the pet (dog, cat, bird, or reptile) in a classical, heroic pose, located in a grand museum hall. The statue should faithfully capture the pet\'s unique features, rendered in pristine white marble with exquisite detail, embodying idealized classical form and monumental presence. The pet is sculpted with a dignified, almost human-like expression. Simple, elegant classical drapery is artfully arranged around the pet, enhancing its heroic bearing. The lighting evokes a serene museum atmosphere, highlighting the luminous marble texture and sculptural form. The pet becomes a timeless work of art, similar to Michelangelo\'s masterpieces.'
    },
    { 
      name: 'Raphael', 
      period: 'High Renaissance',
      malePrompt: 'High Renaissance portrait in the refined manner of Raphael\'s Portrait of Baldassare Castiglione, featuring balanced harmony and noble restraint. The subject\'s masculine features convey intelligence and calm confidence, framed by soft chiaroscuro and a luminous warm tone. The subject is wearing the elegant attire of a Renaissance courtier: a dark doublet with a trim of grey-brown squirrel fur, a bloused creamy-white shirt visible at the chest, and a black beret atop a simple turban-style cap. Subtle brushwork and a limited palette of blacks, creams, warm flesh tones, and muted greys create elegant simplicity. The figure sits in poised three-quarter view, radiating cultivated dignity and introspection, encapsulating Raphael\'s ideal of human grace and classical serenity.',
      femalePrompt: 'High Renaissance portrait with soft luminous feminine beauty and perfect classical proportions. Subject in elegant three-quarter pose wearing sumptuous Renaissance gown with puffed sleeves, rich fabrics of silk and velvet in warm earth tones. Delicate jewelry - pearl necklace, rings, or ornate headdress with translucent veil. One hand delicately positioned near chest or holding small object, displaying graceful fingers. Serene expression with gentle direct gaze, porcelain skin with warm rosy undertones. Balanced harmonious composition with architectural elements or soft landscape background. Refined invisible brushwork, luminous glazing technique, capturing idealized feminine virtue, dignity, and timeless Renaissance elegance. Only one female figure present in composition. Preserve original eyewear if present, do not add or remove glasses. Maintain original hair length exactly as it appears.',
      petPrompt: 'High Renaissance portrait of a pet (dog, cat, bird, or reptile) in the elegant style of Raphael, inspired by noble human portraits. The pet is in a refined three-quarter view, with dignified bearing and an intelligent, gentle expression. It wears a miniature, richly embroidered Renaissance-style collar or cap. The background features a harmonious landscape with soft lighting. The pet\'s fur/feathers/scales are rendered with refined, smooth brushwork, emphasizing luminous and balanced forms, evoking a sense of aristocratic grace and classical composition.'
    },
    { 
      name: 'Rembrandt', 
      period: 'Baroque',
      malePrompt: 'Baroque portrait depicting mastery of light and introspection with dramatic chiaroscuro. The masculine figure wears rich period costume - velvet cap or beret, fur-trimmed robes, ornate gold chain across chest. Emerging from deep shadow, bathed in warm amber and golden tones from single light source. Thick impasto brushwork and layered glazes reveal every crease and contour, weathered hands visible holding painter\'s tools or resting contemplatively. Dark velvety backdrop emphasizes the illuminated face and costume details, capturing profound psychological depth, wisdom, and life experience through masterful play of light and shadow. Preserve original eyewear if present, do not add or remove glasses. Maintain original facial hair style exactly as it appears, do not add or remove facial hair.',
      femalePrompt: 'Baroque portrait with soft feminine features illuminated by warm golden light from single window source. Subject adorned in sumptuous fabrics - rich brocade dress, fur trim, pearl necklaces and jewelry catching the light. Tender gaze with gentle introspective expression, perhaps holding flowers or wearing elaborate headdress with feathers. Rich jewel tones of deep crimson, amber gold, and warm browns create intimate atmosphere. Soft shadows with luminous highlights on silk and velvet textures, layered oil painting technique with subtle glazing. Luxurious period costume details emerge from darkness, conveying warmth, domestic intimacy, and graceful humanity. Only one female figure present in composition. Preserve original eyewear if present, do not add or remove glasses. Maintain original hair length exactly as it appears.',
      petPrompt: 'Baroque portrait of a pet (dog, cat, bird, or reptile) in the dramatic chiaroscuro style of Rembrandt. The pet emerges from deep shadows, bathed in a warm, golden light from a single source, highlighting its fur/feathers/scales with rich amber and brown tones. The pet has an introspective, wise expression, conveying psychological depth. Visible impasto brushwork and thick layered paint application emphasize the texture of its coat or plumage, giving it a dignified, almost aged presence. The dark, velvety background further accentuates the dramatic lighting.'
    },
    { 
      name: 'Johannes Vermeer', 
      period: 'Dutch Golden Age',
      malePrompt: 'Dutch Golden Age portrait of a single masculine subject combining luminous domestic light with contemplative atmosphere. The man, rendered with crystalline precision, sits alone near a window bathed in soft daylight that spills across rich fabrics and wooden textures. Wearing period gentleman\'s attire with white collar and dark jacket. Refined brushwork, harmonious composition, and pearl-like highlights create serenity within an intimate interior. The scene conveys both stillness and quiet narrative tension, embodying mastery of light, texture, and psychological nuance. Only one male figure present in the composition. Preserve original eyewear if present, do not add or remove glasses. Maintain original facial hair style exactly as it appears, do not add or remove facial hair.',
      femalePrompt: 'Dutch Golden Age portrait of a single feminine subject, a close-up three-quarter view with a gentle expression and direct gaze, wearing a simple yellow and blue turban and a large pearl earring. The background is a flat, very dark, indeterminate tone. The light is diffused, coming from the upper left, highlighting the porcelain skin and the textures of the fabric. The overall style embodies the pearl-like luminosity, refined invisible brushwork, and psychological intimacy of Johannes Vermeer\'s \'Girl with a Pearl Earring\'. Only one female figure present in the composition. Preserve original eyewear if present, do not add or remove glasses. Maintain original hair length exactly as it appears.',
      petPrompt: 'Dutch Golden Age portrait of the pet (dog, cat, bird, or reptile) as the "Girl with a Pearl Earring" by Vermeer. The pet is shown in a close-up, three-quarter view, with its head turned to gaze directly at the viewer. It wears a characteristic blue and yellow draped head covering and a prominent pearl earring (or a pet-appropriate substitute like a small, shining charm). The background is a flat, very dark, indeterminate tone, and the pet\'s fur/feathers/scales are rendered with crystalline clarity and pearl-like luminosity, emphasizing soft diffused light. The overall effect is both iconic and whimsical, capturing the pet\'s charm in a masterfully intimate style.'
    },
    { 
      name: 'Claude Monet', 
      period: 'Impressionism',
      malePrompt: 'Impressionist portrait set against vibrant seaside light and coastal gardens. The masculine figure is captured in natural sunlight with flickering brushstrokes and broken color. Loose painterly marks merge blues, ochres, and greens into shimmering atmospheric unity. The background evokes an airy coastal breeze and luminous sky, blending figure and nature in a symphony of color and movement, full of spontaneity and plein-air vitality. Preserve original eyewear if present, do not add or remove glasses. Maintain original facial hair style exactly as it appears, do not add or remove facial hair.',
      femalePrompt: 'Impressionist portrait with soft feminine features captured in natural sunlight, loose delicate brushstrokes, vibrant impressionistic colors with pinks, purples, and yellows, light filtering through fabric or flowers, outdoor garden or water lilies background, atmospheric dreamy effect, fleeting moment captured in motion, airy and light-filled composition, impressionistic spontaneity, emphasizing feminine grace in nature. Only one female figure present in composition. Preserve original eyewear if present, do not add or remove glasses. Maintain original hair length exactly as it appears.',
      petPrompt: 'Impressionist portrait of a pet (dog, cat, bird, or reptile) basking in dappled sunlight within a vibrant outdoor garden or water lilies setting. The pet\'s fur/feathers/scales are rendered with loose, energetic brushstrokes and broken color, shimmering with blues, greens, and golden ochres. The background is an atmospheric, luminous blend of flowers, foliage, and perhaps shimmering water, creating a spontaneous and airy plein-air quality. The composition emphasizes light, color, and movement, capturing the pet\'s playful or serene presence in a natural, fleeting moment.'
    },
    { 
      name: 'Vincent van Gogh', 
      period: 'Post-Impressionism',
      malePrompt: 'Post-Impressionist portrait in the intense style of Vincent van Gogh, inspired by his male self-portraits from 1889, thick impasto brushstrokes with three-dimensional texture, masculine features with strong character, intense penetrating gaze with psychological depth, swirling energetic movement in background, vibrant color palette with cobalt blues, chrome yellows, and emerald greens, visible heavy paint application, expressive gestural brushwork, raw emotional intensity, textured surface with thick pigment, radiating energy lines, characteristic Van Gogh turbulent style, Starry Night background.',
      femalePrompt: 'Post-Impressionist portrait with soft feminine features and emotional depth, thick impasto brushstrokes with heavily textured surface. Swirling Starry Night background with characteristic spiral patterns in deep blues and vibrant yellows, crescent moon and radiating stars in circular swirling motions, night sky with cypress silhouettes or village elements in distance. Vibrant colors of warm peaches in facial tones contrasting with cosmic blues and golden yellows, intense yet tender expression. Visible energetic paint application with distinctive circular brushwork patterns, capturing inner emotion and feminine warmth within celestial setting, expressive and lively composition with iconic swirling night sky energy. Only one female figure present in composition. Preserve original eyewear if present, do not add or remove glasses. Maintain original hair length exactly as it appears.',
      petPrompt: 'Post-Impressionist portrait of a pet (dog, cat, bird, or reptile) in the intense, textured style of Vincent van Gogh, set against a dramatic, swirling Starry Night background. The pet\'s fur/feathers/scales are depicted with thick impasto brushstrokes and three-dimensional texture, conveying a vivid energy. The iconic swirling patterns of deep blues, vibrant yellows, and whites of the night sky, complete with a crescent moon and stars, engulf the background. The pet\'s expression is intense and full of character, rendered with visible, energetic paint application, blending its form with the turbulent, radiant energy of the cosmic landscape.'
    },
    { 
      name: 'Edvard Munch', 
      period: 'Expressionism',
      malePrompt: 'Expressionist portrait in illustrated caricature style with exaggerated emotional distortion. The male figure\'s face rendered with simplified bold lines, elongated oval head shape, hands raised to sides of face in gesture of existential dread. Mouth open in silent expression of anguish, eyes wide with psychological terror. Fluid wavy brushstrokes throughout, swirling sky background of vivid crimson, burnt orange, and deep indigo streaks. Bridge or railing setting with diagonal perspective lines. Stylized almost cartoon-like simplification while maintaining raw emotional power. Bold unnatural colors, warped flowing forms, gestural visible brushwork. The composition captures primal fear and vulnerability through graphic symbolic intensity and expressive distortion. Preserve original eyewear if present, do not add or remove glasses. Maintain original facial hair style exactly as it appears, do not add or remove facial hair.',
      femalePrompt: 'Expressionist portrait in illustrated caricature style with exaggerated emotional distortion. The female figure\'s face rendered with simplified bold lines, elongated oval head shape, hands raised to sides of face in gesture of existential dread. Mouth open in silent expression of anguish, eyes wide with psychological terror. Fluid wavy brushstrokes throughout, swirling sky background of vivid crimson, burnt orange, and deep indigo streaks. Bridge or railing setting with diagonal perspective lines. Stylized almost cartoon-like simplification while maintaining raw emotional power. Bold unnatural colors, warped flowing forms, gestural visible brushwork. The composition captures primal fear and vulnerability through graphic symbolic intensity and expressive distortion. Preserve original eyewear if present, do not add or remove glasses. Maintain original hair length exactly as it appears.',
      petPrompt: 'Expressionist portrait of a pet (dog, cat, bird, or reptile) in a dramatic, illustrated caricature style, embodying a comically exaggerated emotional distortion. The pet\'s face is rendered with simplified, bold lines, and its paws (or wings/limbs) are raised to the sides of its head in a gesture of existential dread or comical panic. Its mouth is open in a silent "scream" or exaggerated howl, eyes wide with humorous terror. The background features fluid, wavy brushstrokes depicting a swirling sky of vivid crimson, burnt orange, and deep indigo streaks, with a bridge or railing setting. The stylized, almost cartoon-like simplification amplifies the primal, yet comical, fear and vulnerability through graphic intensity and expressive distortion.'
    },
    { 
      name: 'Pablo Picasso', 
      period: 'Cubism',
      malePrompt: 'Cubist portrait reimagined through overlapping geometric planes and analytical structure with vibrant abstract color palette. Masculine features are fragmented into angular facets and multiple viewpoints, revealing intellect and form simultaneously. Bold vibrant colors - electric blues, hot pinks, bright yellows, vivid oranges, deep purples, and lime greens create dynamic chromatic energy. Flattened color blocks with sharp contrasts between saturated hues, each geometric plane in distinct vibrant tone. The composition balances abstraction and identity through fragmented architecture, rhythm, and explosive color harmony, expressing modern masculine thought through geometric forms and vivid abstract expressionism. Preserve original eyewear if present, do not add or remove glasses. Maintain original facial hair style exactly as it appears, do not add or remove facial hair.',
      femalePrompt: 'Cubist portrait reimagined through overlapping geometric planes and analytical structure with vibrant abstract color palette. Feminine features are fragmented into angular facets and multiple viewpoints, revealing grace and form simultaneously. Bold vibrant colors - electric blues, hot pinks, bright yellows, vivid oranges, deep purples, and lime greens create dynamic chromatic energy. Flattened color blocks with sharp contrasts between saturated hues, each geometric plane in distinct vibrant tone. The composition balances abstraction and identity through fragmented architecture, rhythm, and explosive color harmony, expressing modern feminine thought through geometric forms and vivid abstract expressionism. Preserve original eyewear if present, do not add or remove glasses. Maintain original hair length exactly as it appears.',
      petPrompt: 'Cubist portrait of a pet (dog, cat, bird, or reptile) reimagined through overlapping geometric planes and analytical structure, with a vibrant abstract color palette. The pet\'s features are fragmented into angular facets and multiple viewpoints, revealing its form and character simultaneously. Bold, vibrant colors—electric blues, hot pinks, bright yellows, vivid oranges, deep purples, and lime greens—create dynamic chromatic energy. Flattened color blocks with sharp contrasts between saturated hues define the composition, balancing abstraction and the pet\'s identifiable features through fragmented shapes, rhythm, and explosive color harmony.'
    },
    { 
      name: 'Salvador Dalí', 
      period: 'Surrealism',
      malePrompt: 'Surrealist composition blending the masculine figure with iconic dreamlike symbolism. Hyperrealistic rendering with photographic precision and meticulous detail. The subject integrated into a fantastical scene featuring melting pocket watches draped over branches or edges, long-legged elephants with spindly legs walking in distant desert landscape, fried eggs, crutches as symbolic supports, distorted architectural elements with impossible perspectives. Smooth flawless glazing technique with warm golden desert light and infinite horizons. The figure maintains realistic portrayal while surrounded by symbolic impossibilities - floating objects, double images, spatial distortions. Vast barren landscape with tiny figures in distance, creating dreamlike scale and subconscious narrative. Preserve original eyewear if present, do not add or remove glasses. Maintain original facial hair style exactly as it appears, do not add or remove facial hair.',
      femalePrompt: 'Surrealist composition blending the feminine figure with iconic dreamlike symbolism. Hyperrealistic rendering with photographic precision and meticulous detail. The subject is integrated into a fantastical scene featuring melting pocket watches draped over branches or edges, long-legged elephants with spindly legs walking across a vast desert landscape, floating orbs, crutches as symbolic supports, and distorted architectural elements with impossible perspectives. Smooth, flawless glazing technique with warm golden desert light and infinite horizons. The woman is portrayed with realistic beauty and serenity, grounded in reality yet surrounded by symbolic impossibilities — levitating objects, mirrored reflections, and spatial distortions. A vast barren landscape stretches into infinity, dotted with tiny distant figures, creating an atmosphere of subconscious mystery and ethereal allure. Preserve original eyewear if present, do not add or remove glasses. Maintain original hairstyle exactly as it appears, do not add or remove hair elements.',
      petPrompt: 'Surrealist composition blending the pet (dog, cat, bird, or reptile) with iconic dreamlike symbolism, rendered with hyperrealistic photographic precision. The pet is integrated into a fantastical scene featuring melting pocket watches draped over branches or edges, long-legged elephants with spindly legs walking in a distant desert landscape, floating bones or toys, and distorted architectural elements with impossible perspectives. Smooth, flawless glazing technique creates warm golden desert light and infinite horizons. The pet maintains its realistic portrayal while surrounded by symbolic impossibilities—floating objects, double images, spatial distortions. A vast barren landscape with tiny figures in the distance creates a dreamlike scale and subconscious narrative, making the pet a whimsical centerpiece in a Dalí-esque dreamscape.'
    },
    { 
      name: 'Andy Warhol', 
      period: 'Pop Art',
      malePrompt: 'Pop Art portrait in iconic 2x2 grid format with four color variations of the same face. High contrast silkscreen aesthetic with simplified bold features - strong jawline, defined nose, expressive eyes reduced to graphic shapes. Each quadrant features different vibrant color combination: top-left with neon pink face on yellow background, top-right with neon green face on blue background, bottom-left with neon yellow face on pink background, bottom-right with neon blue face on green background. Flat planes of solid color, heavy black outlines and shadows, mechanical screen-print texture. The repeated image in saturated artificial colors transforms identity into pop icon, mass-produced celebrity aesthetic with commercial vibrancy and graphic clarity. Preserve original eyewear if present, do not add or remove glasses. Maintain original facial hair style exactly as it appears, do not add or remove facial hair.',
      femalePrompt: 'Pop Art portrait in iconic 2x2 grid format with four color variations of the same face. High contrast silkscreen aesthetic with simplified glamorous features - defined eyes, bold lips, elegant curves reduced to graphic shapes. Each quadrant features different vibrant color combination: top-left with hot pink face on yellow background, top-right with electric blue face on orange background, bottom-left with bright yellow face on magenta background, bottom-right with lime green face on purple background. Flat planes of solid color, heavy black outlines and shadows, mechanical screen-print texture. The repeated feminine image in saturated artificial colors creates mass-produced celebrity glamour with commercial pop iconography and poster-like graphic clarity. Only one female figure present in composition. Preserve original eyewear if present, do not add or remove glasses. Maintain original hair length exactly as it appears.',
      petPrompt: 'Pop Art portrait of a pet (dog, cat, bird, or reptile) in an iconic 2x2 grid format, featuring four color variations of the same pet\'s face. Rendered with a high-contrast silkscreen aesthetic and simplified bold features – expressive eyes, nose, and distinct outlines reduced to graphic shapes. Each quadrant showcases a different vibrant color combination: top-left with neon pink pet on a yellow background, top-right with neon green pet on a blue background, bottom-left with neon yellow pet on a pink background, bottom-right with neon blue pet on a green background. Flat planes of solid color, heavy black outlines, and mechanical screen-print texture create a mass-produced celebrity pet aesthetic with commercial vibrancy and graphic clarity.'
    },
    { 
      name: 'Grant Wood', 
      period: 'American Regionalism',
      malePrompt: 'American Regionalist portrait in two-figure composition featuring a stern-faced man and woman standing together in front of white clapboard house with Gothic window. Transform the male subject into the farmer figure in foreground - wearing dark jacket with white collarless shirt, round wire spectacles, holding three-pronged pitchfork vertically. The man rendered with resolute stoic posture and plain dignity, balding or short hair, gazing directly forward with serious expression. Keep the woman in background as the original composition shows - modest period dress with white collar, cameo brooch at neck, standing slightly behind. Both rendered in crisp lines and smooth enamel texture with precise stylized features. Earthy browns, greens, and muted blues evoke rural Midwestern honesty. Folk art influence with clean linear forms, capturing American heartland endurance. The male subject should clearly become the pitchfork-holding farmer while woman remains faithful to original painting. Preserve original eyewear if present, do not add or remove glasses. Maintain original facial hair style exactly as it appears, do not add or remove facial hair.',
      femalePrompt: 'American Regionalist portrait in two-figure composition featuring a man and woman standing together in front of white clapboard house with Gothic window. Transform the female subject into the woman figure - wearing modest period dress with white rickrack trim, white collar, cameo brooch at neck, hair pulled back in severe center part into a bun. The woman rendered with precise stylized features, strong Midwestern character with gentle restrained dignity, modest serious expression, standing slightly behind or beside. Keep the man as the original composition shows - stern farmer in dark jacket, holding three-pronged pitchfork, round spectacles, balding, gazing forward stoically. Both rendered in crisp lines and smooth enamel-like finish with precise folk art style. Warm earth tones with soft pastels, clean linear forms. The female subject should clearly become the modest woman in period dress while man remains faithful to original painting composition. Only one female figure present in composition. Preserve original eyewear if present, do not add or remove glasses. Maintain original hair length exactly as it appears.',
      petPrompt: 'American Regionalist portrait of a pet (dog, cat, bird, or reptile) dressed as the farmer/man from Grant Wood\'s American Gothic, standing resolutely in front of a white clapboard house with a Gothic window. The pet is posed with a severe, stoic dignity, its expression serious and earnest. The pet\'s markings and features are stylized with clean, linear forms and a smooth, enamel-like finish. The background is a simple, muted landscape in earthy browns and greens, evoking rural Midwestern honesty. The composition captures the pet\'s enduring character through folk art influence and simplified, precise forms.'
    }
  ];

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
            
            if (!session.selected_gender) {
              setCurrentStep('gender-select');
            } else if (Object.keys(parsedSelectedVariations).length === 12) {
              setCurrentStep('preview');
            } else {
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
        console.log('✅ Code verified');
        setCurrentStep('gender-select');
      } else {
        alert(data.error || 'Invalid code');
        setVerificationCode(['', '', '', '', '', '']);
        if (codeInputRefs.current[0]) {
          codeInputRefs.current[0].focus();
        }
      }
    } catch (error) {
      console.error('❌ Verification error:', error);
      alert('Verification failed');
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

  const selectGenderAndStartBatchGeneration = async (gender) => {
    setSelectedGender(gender);
    await saveSession({ 
      selected_gender: gender,
      cover_color: coverColor
    });
    setCurrentStep('batch-generating');
    setBatchGenerating(true);
    setBatchProgress(0);
    
    // Start progress simulation
    const progressInterval = setInterval(() => {
      setBatchProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return prev;
        }
        // Progress slows down as it gets higher (more realistic)
        const increment = prev < 30 ? 3 : prev < 60 ? 2 : 1;
        return Math.min(95, prev + increment);
      });
    }, 1000);
    
    // Start batch generation
    setTimeout(() => {
      generateAllTwelve(gender).then(() => {
        clearInterval(progressInterval);
        setBatchProgress(100);
      });
    }, 500);
    
    // Move to personalization after 2 seconds so user can fill it out while generating
    setTimeout(() => {
      setCurrentStep('personalization');
    }, 2000);
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
        setCurrentStep('preview');
      } else {
        throw new Error(data.error || 'Batch generation failed');
      }
    } catch (error) {
      console.error('❌ Batch generation error:', error);
      setBatchGenerating(false);
      alert('Generation failed. Please try again.');
    }
  };

  const regenerateArtist = async (artistIndex) => {
    setIsGenerating(true);
    const artist = artists[artistIndex];
    const promptKey = selectedGender === 'Male' ? 'malePrompt' : 
                      selectedGender === 'Female' ? 'femalePrompt' : 'petPrompt';
    const artistPrompt = artist[promptKey];

    try {
      const response = await fetch(`${BACKEND_URL}/api/generate-variations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: uploadedImage,
          artistName: artist.name,
          artistPrompt: artistPrompt,
          count: 2
        })
      });

      const data = await response.json();

      if (data.success) {
        const newImages = { ...generatedImages };
        newImages[artistIndex] = data.variations;
        setGeneratedImages(newImages);
        setShowArtistModal(false);
        setIsGenerating(false);
      }
    } catch (error) {
      console.error('❌ Regeneration failed:', error);
      setIsGenerating(false);
      alert('Regeneration failed');
    }
  };

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
            className="flex items-center gap-2 text-2xl font-bold">
            <span>🎨</span>
            <span className="bg-gradient-to-r from-amber-600 to-red-600 text-transparent bg-clip-text">
              MasterpieceMe
            </span>
          </button>

          <div className="flex items-center gap-4">
            {sessionId && (
              <button
                onClick={copyLink}
                className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-full hover:bg-amber-200 transition font-semibold">
                <Link className="w-4 h-4" />
                Copy Link
              </button>
            )}
            <button
              onClick={() => setCurrentStep('home')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition">
              <Home className="w-4 h-4" />
              Home
            </button>
          </div>
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
        <section className="max-w-4xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-amber-600 to-red-600 text-transparent bg-clip-text">
              See Yourself as a Masterpiece
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8">
              Transform your photo into 12 legendary art styles
            </p>
          </div>

          <div
            className={`relative border-4 border-dashed rounded-3xl p-12 transition ${
              isDragging ? 'border-amber-600 bg-amber-50' : 'border-gray-300 bg-white'
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}>
            
            {uploadedImage ? (
              <div className="text-center">
                <img
                  src={uploadedImage}
                  alt="Uploaded"
                  className="mx-auto max-w-md rounded-2xl shadow-xl mb-6"
                />
                <button
                  onClick={() => {
                    setUploadedImage(null);
                    setSessionId(null);
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition">
                  Choose Different Photo
                </button>
              </div>
            ) : (
              <div className="text-center">
                <Upload className="w-20 h-20 mx-auto mb-4 text-amber-600" />
                <h3 className="text-2xl font-bold mb-2">Upload Your Photo</h3>
                <p className="text-gray-600 mb-6">Drag & drop or click to browse</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-8 py-4 bg-gradient-to-r from-amber-600 to-red-600 text-white rounded-full font-bold hover:shadow-xl transition">
                  Select Photo
                </button>
              </div>
            )}
          </div>

          {uploadedImage && !captchaVerified && (
            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-4">Verify you're human to continue:</p>
              <div className="flex justify-center">
                <Turnstile
                  siteKey={TURNSTILE_SITE_KEY}
                  onSuccess={handleCaptchaSuccess}
                  theme="light"
                />
              </div>
            </div>
          )}

          {uploadedImage && captchaVerified && !sessionId && (
            <div className="mt-8 text-center">
              <Loader className="w-8 h-8 animate-spin mx-auto text-amber-600" />
              <p className="mt-2 text-gray-600">Creating your session...</p>
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
      )}

      {/* VERIFY CONTACT STEP */}
      {currentStep === 'verify-contact' && (
        <section className="max-w-3xl mx-auto px-4 py-20">
          {!contactVerified ? (
            <div>
              {!verificationSent ? (
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl">
                  <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
                    Verify Your Contact
                  </h2>
                  <p className="text-gray-600 text-center mb-8">
                    We'll send you a 6-digit code to access your masterpiece anytime
                  </p>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-lg font-semibold mb-2">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:border-amber-600 focus:outline-none text-lg"
                      />
                    </div>

                    <div className="text-center text-gray-500 font-semibold">OR</div>

                    <div>
                      <label className="block text-lg font-semibold mb-2">Phone Number (SMS)</label>
                      <input
                        type="tel"
                        value={sms}
                        onChange={(e) => setSms(e.target.value)}
                        placeholder="(555) 123-4567"
                        className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:border-amber-600 focus:outline-none text-lg"
                      />
                    </div>

                    <button
                      onClick={requestVerification}
                      disabled={isVerifying || (!email && !sms)}
                      className="w-full py-4 bg-gradient-to-r from-amber-600 to-red-600 text-white rounded-full font-bold text-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed">
                      {isVerifying ? 'Sending...' : 'Send Verification Code'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl">
                  <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
                    Enter Your Code
                  </h2>
                  <p className="text-gray-600 text-center mb-8">
                    We sent a 6-digit code to {email || sms}
                  </p>

                  <div className="flex justify-center gap-2 mb-8">
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <input
                        key={index}
                        ref={(el) => (codeInputsRef.current[index] = el)}
                        type="text"
                        maxLength={1}
                        value={verificationCode[index] || ''}
                        onChange={(e) => handleCodeInput(index, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
                            codeInputsRef.current[index - 1]?.focus();
                          }
                        }}
                        className="w-12 h-14 md:w-16 md:h-20 text-center text-2xl md:text-3xl font-bold border-2 border-gray-300 rounded-xl focus:border-amber-600 focus:outline-none"
                      />
                    ))}
                  </div>

                  {verificationError && (
                    <p className="text-red-600 text-center mb-4">{verificationError}</p>
                  )}

                  <div className="text-center text-sm text-gray-600">
                    Didn't receive it?
                    <span className="text-gray-400 mx-2">|</span>
                    <button
                      onClick={requestVerification}
                      disabled={isVerifying}
                      className="text-amber-600 hover:text-amber-700 font-semibold disabled:opacity-50">
                      Resend code
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </section>
      )}

      {/* GENDER SELECT STEP - NOW FIRST */}
      {currentStep === 'gender-select' && (
        <section className="max-w-5xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Choose Your Style</h2>
            <p className="text-lg md:text-xl text-gray-600">
              Select how you'd like to be portrayed across all 12 legendary artists
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <button
              onClick={() => selectGenderAndStartBatchGeneration('Male')}
              className="group relative bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl p-8 hover:shadow-2xl transition transform hover:scale-105">
              <div className="text-center">
                <div className="text-6xl mb-4">👨</div>
                <h3 className="text-3xl font-bold text-white mb-2">Male</h3>
                <p className="text-blue-100">Portrayed as David, Self-Portraits, and more</p>
              </div>
            </button>

            <button
              onClick={() => selectGenderAndStartBatchGeneration('Female')}
              className="group relative bg-gradient-to-br from-pink-500 to-red-600 rounded-3xl p-8 hover:shadow-2xl transition transform hover:scale-105">
              <div className="text-center">
                <div className="text-6xl mb-4">👩</div>
                <h3 className="text-3xl font-bold text-white mb-2">Female</h3>
                <p className="text-pink-100">Portrayed as Mona Lisa, Girl with Pearl Earring, and more</p>
              </div>
            </button>

            <button
              onClick={() => selectGenderAndStartBatchGeneration('Pet')}
              className="group relative bg-gradient-to-br from-green-500 to-teal-600 rounded-3xl p-8 hover:shadow-2xl transition transform hover:scale-105">
              <div className="text-center">
                <div className="text-6xl mb-4">🐾</div>
                <h3 className="text-3xl font-bold text-white mb-2">Pet</h3>
                <p className="text-green-100">Your furry friend in legendary art styles</p>
              </div>
            </button>
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
            <p className="text-sm text-amber-600 mt-2">⏳ Your 12 portraits are generating in the background...</p>
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
            <h2 className="text-4xl md:text-5xl font-bold mb-4">🎨 Your 12 Masterpieces</h2>
            <p className="text-lg md:text-xl text-gray-600">
              All 12 artists complete! Review your collection below
            </p>
          </div>

          {/* 12 AI-GENERATED IMAGES GRID */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-center mb-6">Your Portrait Gallery</h3>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-6">
              {Object.entries(selectedVariations).map(([artistIdx, variation]) => {
                const artist = artists[parseInt(artistIdx)];
                return (
                  <button
                    key={artistIdx}
                    onClick={() => {
                      setSelectedModalImage({ ...variation, artist, artistIdx: parseInt(artistIdx) });
                      setShowImageModal(true);
                    }}
                    className="group relative">
                    <div className="overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition aspect-square">
                      <img
                        src={variation.url}
                        alt={artist.name}
                        className="w-full h-full object-contain group-hover:scale-110 transition duration-300"
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
                      src="/book-pages/cover-full.png" 
                      alt="Full Book Cover"
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
                  <div className="relative w-full h-full max-w-full aspect-square">
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
                        <p className="text-xs md:text-sm lg:text-base text-gray-700 italic leading-snug font-serif whitespace-pre-wrap break-words max-w-full px-2">
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
              
              bookPages.push({
                type: 'artwork',
                artistIdx: i,
                title: `${artist.name} Portrait`,
                pageNumber: 5 + (i * 2),
                content: (
                  <div 
                    className="w-full h-full bg-gray-900 flex items-center justify-center p-4 cursor-pointer hover:opacity-95 transition group"
                    onClick={() => {
                      setSelectedModalImage({ ...aiImage, artist, artistIdx: i });
                      setShowImageModal(true);
                    }}>
                    <div className="relative w-full h-full flex items-center justify-center aspect-square">
                      <img
                        src={aiImage?.url}
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
                      src="/book-pages/cover-full.png" 
                      alt="Full Book Cover (Back)"
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
                    <label className="block text-lg font-semibold text-gray-700 mb-3 text-center">
                      Cover Color Preview
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                      {colorOptions.map((color) => (
                        <button
                          key={color.name}
                          onClick={async () => {
                            setCoverColor(color.name);
                            await saveSession({ cover_color: color.name });
                          }}
                          className={`p-3 rounded-xl border-4 transition ${
                            coverColor === color.name ? 'border-amber-600 scale-105' : 'border-gray-200'
                          }`}>
                          <div className={`w-full h-12 rounded-lg ${color.bg} mb-1`}></div>
                          <p className="text-xs font-semibold">{color.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="max-w-6xl mx-auto">
                    <div className="bg-gray-100 rounded-3xl shadow-2xl p-8 mb-8">
                      <div className="flex gap-4 justify-center items-stretch">
                        {(currentBookPage === 0 || currentBookPage === totalPages - 1) ? (
                          <div 
                            className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-4xl">
                            {bookPages[currentBookPage].content}
                          </div>
                        ) : (
                          <>
                            {leftPage && (
                              <div 
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
                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                    onClick={() => setShowImageModal(false)}>
                    <button
                      onClick={() => setShowImageModal(false)}
                      className="absolute top-4 right-4 bg-white text-gray-900 p-3 rounded-full hover:bg-gray-200 transition z-10">
                      <X className="w-6 h-6" />
                    </button>
                    <div className="max-w-5xl w-full">
                      <img
                        src={selectedModalImage.url}
                        alt={selectedModalImage.artist?.name}
                        className="w-full h-auto rounded-lg shadow-2xl mb-6"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="text-center text-white mb-6">
                        <p className="text-2xl md:text-3xl font-bold">{selectedModalImage.artist?.name}</p>
                        <p className="text-lg md:text-xl text-gray-300 mt-2">{selectedModalImage.artist?.period}</p>
                      </div>
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
                    </div>
                  </div>
                )}

                {/* ARTIST CHANGE MODAL */}
                {showArtistModal && selectedArtistForChange !== null && (
                  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-3xl font-bold">
                          Choose New {artists[selectedArtistForChange].name} Portrait
                        </h3>
                        <button
                          onClick={() => {
                            setShowArtistModal(false);
                            setSelectedArtistForChange(null);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-full">
                          <X className="w-6 h-6" />
                        </button>
                      </div>

                      {isGenerating ? (
                        <div className="text-center py-12">
                          <Loader className="w-16 h-16 text-amber-600 animate-spin mx-auto mb-4" />
                          <p className="text-xl font-bold">Generating new variations...</p>
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-2 gap-6 mb-6">
                            {generatedImages[selectedArtistForChange]?.map((img, idx) => (
                              <button
                                key={idx}
                                onClick={() => selectNewVariation(selectedArtistForChange, img)}
                                className="relative group">
                                <div className="overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition">
                                  <img
                                    src={img.url}
                                    alt={`Variation ${idx + 1}`}
                                    className="w-full h-64 object-cover group-hover:scale-110 transition duration-300"
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                    <div className="bg-white rounded-full p-4">
                                      <Check className="w-8 h-8 text-amber-600" />
                                    </div>
                                  </div>
                                </div>
                                <p className="text-center mt-2 font-semibold">Click to Select</p>
                              </button>
                            ))}
                          </div>

                          <button
                            onClick={() => regenerateArtist(selectedArtistForChange)}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-full font-bold text-lg transition">
                            🔄 Generate 2 New Variations
                          </button>
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

                {/* Cover Type Selector */}
                <CoverTypeSelector 
                  selectedCover={coverType}
                  onCoverChange={handleCoverChange}
                />

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
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-gradient-to-r from-amber-600 to-red-600 text-white py-4 rounded-full font-bold hover:shadow-xl transition">
                    Proceed to Secure Checkout →
                  </button>
                </div>
              </>
            );
          })()}
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
              <p className="text-sm text-gray-500">Contact us at support@masterpieceme.com</p>
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