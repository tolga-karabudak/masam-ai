import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Mock setup data based on the PRD
const mockSetups = [
    {
        title: 'Neon Warrior Gaming Setup',
        image_url: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?q=80&w=2670&auto=format&fit=crop',
        thumbnail_url: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?q=80&w=800&auto=format&fit=crop',
        source: 'system',
        is_public: true,
        categories: ['gaming_rgb'],
        desk_size: 'wide',
        color_palette: ['dark', 'rgb'],
        lighting: 'rgb',
        peripheral_zones: {
            keyboard: { x1: 500, y1: 700, x2: 1200, y2: 900 },
            mouse: { x1: 1300, y1: 720, x2: 1500, y2: 880 },
            mousepad: { x1: 450, y1: 650, x2: 1600, y2: 950 },
            headset: { x1: 100, y1: 400, x2: 300, y2: 700 },
        }
    },
    {
        title: 'Minimalist Clean Desk',
        image_url: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?q=80&w=2670&auto=format&fit=crop',
        thumbnail_url: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?q=80&w=800&auto=format&fit=crop',
        source: 'system',
        is_public: true,
        categories: ['minimalist', 'professional'],
        desk_size: 'standard',
        color_palette: ['light', 'wood'],
        lighting: 'natural',
        peripheral_zones: {
            keyboard: { x1: 800, y1: 600, x2: 1400, y2: 750 },
            mouse: { x1: 1500, y1: 620, x2: 1650, y2: 720 },
            mousepad: { x1: 750, y1: 550, x2: 1750, y2: 800 },
        }
    },
    {
        title: 'Stealth Developer Space',
        image_url: 'https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?q=80&w=2670&auto=format&fit=crop',
        thumbnail_url: 'https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?q=80&w=800&auto=format&fit=crop',
        source: 'system',
        is_public: true,
        categories: ['stealth', 'verimlilik & kodlama'],
        desk_size: 'wide',
        color_palette: ['dark'],
        lighting: 'dark',
        peripheral_zones: {
            keyboard: { x1: 600, y1: 500, x2: 1100, y2: 650 },
            mouse: { x1: 1200, y1: 520, x2: 1350, y2: 620 },
        }
    },
    {
        title: 'Dark RGB Dual Monitor Setup',
        image_url: '/setup-dark-dual-monitor.jpg',
        thumbnail_url: '/setup-dark-dual-monitor.jpg',
        source: 'system',
        is_public: true,
        categories: ['gaming_rgb', 'verimlilik & kodlama'],
        desk_size: 'wide',
        color_palette: ['dark', 'rgb'],
        lighting: 'rgb',
        peripheral_zones: {
            keyboard: { x1: 360, y1: 720, x2: 740, y2: 870 },
            mouse: { x1: 760, y1: 730, x2: 890, y2: 840 },
            mousepad: { x1: 280, y1: 680, x2: 970, y2: 920 },
        }
    }
];

export async function POST(request: Request) {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const authHeader = request.headers.get('authorization')
        if (authHeader !== `Bearer ${process.env.ADMIN_SECRET_TOKEN}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data, error } = await supabase
            .from('setups')
            .insert(mockSetups)
            .select('id')

        if (error) throw error

        return NextResponse.json({
            success: true,
            count: data.length,
            ids: data.map(d => d.id)
        })

    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Seeding failed' }, { status: 500 })
    }
}
