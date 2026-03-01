export default function UrunlerLoading() {
    return (
        <div className="min-h-screen bg-masam-black flex flex-col pt-24 px-6 lg:px-12 pb-24 animate-pulse">
            <div className="max-w-[1600px] w-full mx-auto mb-12 flex flex-col md:flex-row items-baseline justify-between gap-6 border-b border-masam-border-subtle pb-6">
                <div className="h-10 w-48 bg-masam-elevated rounded" />
                <div className="h-10 w-32 bg-masam-elevated rounded" />
            </div>
            <div className="max-w-[1600px] w-full mx-auto grid grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="aspect-square bg-masam-elevated rounded-sm" />
                ))}
            </div>
        </div>
    )
}
