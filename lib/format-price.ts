const tryCurrencyFormatter = (() => {
    try {
        return new Intl.NumberFormat("tr-TR", {
            style: "currency",
            currency: "TRY",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        })
    } catch {
        return null
    }
})()

export function formatPrice(price: number): string {
    if (tryCurrencyFormatter) return tryCurrencyFormatter.format(price)
    return `₺${Math.round(price).toLocaleString("tr-TR")}`
}
