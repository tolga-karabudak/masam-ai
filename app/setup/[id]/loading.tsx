export default function SetupDetailLoading() {
    return (
        <div className="flex flex-col md:flex-row md:h-[calc(100vh-4rem)] bg-masam-black animate-pulse">
            {/* Image viewer skeleton */}
            <div className="flex-1 relative min-h-[300px] md:h-full bg-masam-elevated" />

            {/* Product panel skeleton */}
            <div className="w-full md:w-[380px] md:h-full flex-shrink-0 border-t md:border-t-0 md:border-l border-masam-border-subtle bg-masam-black">
                <div className="p-4 border-b border-masam-border-subtle">
                    <div className="h-5 w-24 bg-masam-elevated rounded mb-3" />
                    <div className="flex flex-wrap gap-1.5">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-8 w-20 bg-masam-elevated rounded-lg" />
                        ))}
                    </div>
                </div>
                <div className="p-4 space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex gap-3 p-3 rounded-xl border border-masam-border-subtle">
                            <div className="w-14 h-14 bg-masam-elevated rounded-lg flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="h-3 w-16 bg-masam-elevated rounded" />
                                <div className="h-4 w-full bg-masam-elevated rounded" />
                                <div className="h-3 w-20 bg-masam-elevated rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
