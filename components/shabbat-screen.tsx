"use client"

// Shown in place of the video from candle lighting until havdalah: a still
// Shabbat picture, no video, no music. Deliberately static (no animation) so
// the old TV does nothing but display an image.

interface Props {
  parasha: string | null
  havdalah: string | null
}

export function ShabbatScreen({ parasha, havdalah }: Props) {
  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      <img
        src="/images/shabbat-background.jpg"
        alt="שולחן שבת: חלות, נרות ויין"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-8 pt-24 pb-8 text-center text-white">
        <h2 className="text-7xl font-black mb-3 drop-shadow-lg">שבת שלום</h2>
        {parasha && <p className="text-3xl font-bold mb-1 drop-shadow">פרשת {parasha}</p>}
        {havdalah && <p className="text-2xl opacity-90 drop-shadow">צאת השבת: {havdalah}</p>}
      </div>
    </div>
  )
}
