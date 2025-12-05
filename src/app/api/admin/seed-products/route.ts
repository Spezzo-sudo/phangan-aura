import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    const supabase = await createClient();

    const products = [
        {
            name: { en: "Organic Coconut Oil", th: "น้ำมันมะพร้าวออร์แกนิก" },
            description: { en: "Pure, cold-pressed coconut oil for skin and hair.", th: "น้ำมันมะพร้าวบริสุทธิ์สกัดเย็นสำหรับผิวและเส้นผม" },
            price_thb: 350,
            image_url: "/images/products/coconut-oil.webp",
            category: "Body Care",
            stock_quantity: 50,
            is_active: true,
            slug: "organic-coconut-oil"
        },
        {
            name: { en: "Aloe Vera Gel", th: "เจลว่านหางจระเข้" },
            description: { en: "Soothing gel for sun-exposed skin.", th: "เจลปลอบประโลมผิวหลังออกแดด" },
            price_thb: 250,
            image_url: "/images/products/aloe-vera.webp",
            category: "After Sun",
            stock_quantity: 30,
            is_active: true,
            slug: "aloe-vera-gel"
        },
        {
            name: { en: "Lemongrass Essential Oil", th: "น้ำมันหอมระเหยตะไคร้" },
            description: { en: "Refreshing scent for aromatherapy.", th: "กลิ่นหอมสดชื่นสำหรับอโรมาเทอราพี" },
            price_thb: 450,
            image_url: "/images/products/lemongrass.webp",
            category: "Aromatherapy",
            stock_quantity: 20,
            is_active: true,
            slug: "lemongrass-essential-oil"
        },
        {
            name: { en: "Handmade Soap Set", th: "ชุดสบู่ทำมือ" },
            description: { en: "Natural ingredients, gentle on skin.", th: "ส่วนผสมจากธรรมชาติ อ่อนโยนต่อผิว" },
            price_thb: 300,
            image_url: "/images/products/soap-set.webp",
            category: "Skincare",
            stock_quantity: 15,
            is_active: true,
            slug: "handmade-soap-set"
        }
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
        .from('products')
        .upsert(products, { onConflict: 'slug' })
        .select();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: data.length, products: data });
}
