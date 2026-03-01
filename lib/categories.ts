/**
 * Kategori slug/İngilizce → Türkçe görüntüleme adı.
 * DB'deki category değeri aynen kalır; sadece UI'da Türkçe gösterilir.
 */
const CATEGORY_LABELS_TR: Record<string, string> = {
    mouse: "Fare",
    Mouse: "Fare",
    keyboard: "Klavye",
    Klavye: "Klavye",
    mousepad: "Mousepad",
    Mousepad: "Mousepad",
    headset: "Kulaklık",
    Kulaklık: "Kulaklık",
    "Kulaklık ve Ses": "Kulaklık",
    microphone: "Mikrofon",
    Mikrofon: "Mikrofon",
    webcam: "Web Kamerası",
    Webcamler: "Web Kamerası",
    chair: "Oyuncu Koltuğu",
    "Oyuncu Koltukları": "Oyuncu Koltuğu",
}

export function getCategoryLabelTr(category: string): string {
    if (!category || typeof category !== "string") return ""
    const trimmed = category.trim()
    return CATEGORY_LABELS_TR[trimmed] ?? trimmed
}
