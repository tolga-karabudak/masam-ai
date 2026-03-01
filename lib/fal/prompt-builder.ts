export const CATEGORY_PROMPTS: Record<string, string> = {
    gaming_rgb: 'on a dark gaming desk with RGB ambient lighting, neon glow, dark room',
    minimalist: 'on a clean white minimal desk, soft natural daylight, few items',
    stealth: 'on an all-black stealth desk setup, matte finish, subtle dark lighting',
    retro: 'on a warm retro desk with wood accents, vintage warm tungsten lighting',
    professional: 'on a clean professional office desk, neutral daylight, organized',
    cyberpunk: 'on a cyberpunk desk with neon purple and blue lighting, futuristic',
    nature: 'on a desk with green plants and natural wood accents, warm sunlight',
    pastel: 'on a pastel-themed cozy desk, soft pink and mint tones, warm gentle lighting',
    industrial: 'on an industrial desk with metal and concrete textures, exposed bulb lighting',
    creator_studio: 'on a content creator desk with studio lighting, professional setup',
};

export function buildInpaintPrompt(
    productName: string,
    categories: string[],
    peripheralType: string,
): string {
    const categoryStyle = categories && categories.length > 0
        ? CATEGORY_PROMPTS[categories[0]] || 'on a modern desk'
        : 'on a modern desk';

    const peripheralNames: Record<string, string> = {
        mouse: 'gaming mouse',
        keyboard: 'mechanical keyboard',
        mousepad: 'desk mousepad',
        headset: 'over-ear headphones',
        microphone: 'studio microphone on boom arm',
        webcam: 'webcam mounted on monitor',
        chair: 'gaming/office chair',
    };

    const typeLabel = peripheralNames[peripheralType.toLowerCase()] || peripheralType;

    return `A ${productName} ${typeLabel} placed naturally ${categoryStyle}, photorealistic product photography, matching scene perspective and lighting perfectly, high detail, seamless integration with the desk surface`;
}
