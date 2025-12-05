import { Database } from "@/types/database";

type Profile = Database['public']['Tables']['profiles']['Row'];
type Service = Database['public']['Tables']['services']['Row'];
type StaffService = Database['public']['Tables']['staff_services']['Row'];


// Mock Services (matching the SQL schema structure)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const MOCK_SERVICES: any[] = [
    {
        id: "s1",
        title: "Thai Oil Massage",
        description: "Relaxing oil massage combining Thai techniques.",
        category: "massage",
        duration_min: 60,
        price_thb: 500,
        image_url: "/images/services/thai-oil.webp",
        is_active: true,
        created_at: new Date().toISOString(),
    },
    {
        id: "s2",
        title: "Deep Tissue Massage",
        description: "Intense massage for muscle recovery.",
        category: "massage",
        duration_min: 60,
        price_thb: 800,
        image_url: "/images/services/deep-tissue.webp",
        is_active: true,
        created_at: new Date().toISOString(),
    },
    {
        id: "s3",
        title: "Classic Manicure",
        description: "Nail shaping and polish.",
        category: "nails",
        duration_min: 45,
        price_thb: 400,
        image_url: "/images/services/manicure.webp",
        is_active: true,
        created_at: new Date().toISOString(),
    },
];

// Mock Staff Profiles
export const MOCK_STAFF: Profile[] = [
    {
        id: "staff1",
        email: "sarah@phangan-aura.com",
        full_name: "Sarah",
        role: "staff",
        avatar_url: "/images/staff/sarah.webp",
        phone: null,
        bio: "Expert in Thai Massage with 10 years experience.",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    {
        id: "staff2",
        email: "noi@phangan-aura.com",
        full_name: "Noi",
        role: "staff",
        avatar_url: "/images/staff/noi.webp",
        phone: null,
        bio: "Specialist for Nail Art and Beauty treatments.",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
];

// Mock Staff Skills (Who can do what?)
export const MOCK_STAFF_SERVICES: StaffService[] = [
    // Sarah does Massages
    { staff_id: "staff1", service_id: "s1" },
    { staff_id: "staff1", service_id: "s2" },

    // Noi does Nails
    { staff_id: "staff2", service_id: "s3" },
];


