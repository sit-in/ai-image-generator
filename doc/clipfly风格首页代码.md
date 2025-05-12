# Clipfly风格复刻首页代码（app/page.tsx）

```tsx
import NavBar from "@/components/NavBar"
import FeatureCard from "@/components/FeatureCard"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100">
      <NavBar />
      <main className="flex flex-col items-center justify-center py-16">
        <h1 className="text-5xl font-extrabold text-center mb-4">
          Your Everyday AI Video <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Toolkit✨</span>
        </h1>
        <p className="text-lg text-gray-600 text-center mb-8 max-w-2xl">
          Craft stunning videos with our AI-powered video generator. Create, enhance, edit, all in one place, fast and easy! Unleash your creativity now!
        </p>
        <button className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold shadow-lg mb-12 hover:scale-105 transition">
          Generate
        </button>
        <section className="grid grid-cols-1 md:grid-cols-4 gap-8 w-full max-w-6xl">
          <FeatureCard
            title="AI Video Generator"
            desc="Create videos from text and photos"
            img="/images/ai-video.jpg"
          />
          <FeatureCard
            title="AI Kissing Generator"
            desc="Create a romantic soft or French kiss"
            img="/images/ai-kiss.jpg"
          />
          <FeatureCard
            title="AI Image to Video"
            desc="Animate images to bring anything to life"
            img="/images/ai-image2video.jpg"
          />
          <FeatureCard
            title="AI Video Enhancer"
            desc="Enhance video quality and refine details"
            img="/images/ai-enhance.jpg"
          />
        </section>
      </main>
    </div>
  )
}
```

---

### NavBar 组件示例（components/NavBar.tsx）

```tsx
export default function NavBar() {
  return (
    <nav className="flex justify-between items-center px-8 py-4">
      <div className="text-2xl font-bold">Clipfly</div>
      <ul className="flex gap-6 items-center">
        <li className="text-gray-700 hover:text-purple-600 cursor-pointer">Video Editing</li>
        <li className="text-gray-700 hover:text-purple-600 cursor-pointer">AI Video</li>
        <li className="text-gray-700 hover:text-purple-600 cursor-pointer">AI Image</li>
        <li className="text-gray-700 hover:text-purple-600 cursor-pointer">Support</li>
        <li className="bg-yellow-200 px-3 py-1 rounded-lg font-bold ml-4">15 Credits</li>
        <li className="bg-purple-500 text-white px-3 py-1 rounded-lg font-bold ml-2">PRO</li>
        <li className="bg-green-500 text-white w-8 h-8 flex items-center justify-center rounded-full ml-2">T</li>
      </ul>
    </nav>
  )
}
```

---

### FeatureCard 组件示例（components/FeatureCard.tsx）

```tsx
import Image from "next/image"

export default function FeatureCard({ title, desc, img }: { title: string, desc: string, img: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center hover:scale-105 transition">
      <div className="w-24 h-24 mb-4 relative">
        <Image src={img} alt={title} fill className="object-cover rounded-xl" />
      </div>
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <p className="text-gray-500 text-center">{desc}</p>
    </div>
  )
}
```

</rewritten_file> 