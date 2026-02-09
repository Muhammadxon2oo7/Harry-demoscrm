// import Image from "next/image";

// export default function Footer() {
//   return (
//     <footer className="bg-secondary/50 border-t border-accent/20 py-12 px-6">
//       <div className="max-w-6xl mx-auto">
//         <div className="grid md:grid-cols-4 gap-8 mb-8">
//           <div>
//             <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
//               <Image
//                           src="/logo.png"
//                           alt="Logo"
//                           width={40}
//                           height={40}
//                           className="rounded-lg"
//                         />
//               Harry Potter Academy
//             </h3>
//             <p className="text-sm text-foreground/60">Bilimga to'la tarbiya va zamonavoy usullar</p>
//           </div>

//           <div>
//             <h4 className="font-semibold text-foreground mb-4">Kurslar</h4>
//             <ul className="space-y-2 text-sm text-foreground/60">
//               <li>
//                 <a href="#" className="hover:text-primary transition-colors">
//                   Ingliz tili
//                 </a>
//               </li>
//               <li>
//                 <a href="#" className="hover:text-primary transition-colors">
//                   Rus tili
//                 </a>
//               </li>
//               <li>
//                 <a href="#" className="hover:text-primary transition-colors">
//                   Turk tili
//                 </a>
//               </li>
//               <li>
//                 <a href="#" className="hover:text-primary transition-colors">
//                   Koreys tili
//                 </a>
//               </li>
//             </ul>
//           </div>

//           <div>
//             <h4 className="font-semibold text-foreground mb-4">Fanlar</h4>
//             <ul className="space-y-2 text-sm text-foreground/60">
//               <li>
//                 <a href="#" className="hover:text-primary transition-colors">
//                   Kimyo
//                 </a>
//               </li>
//               <li>
//                 <a href="#" className="hover:text-primary transition-colors">
//                   Biologiya
//                 </a>
//               </li>
//               <li>
//                 <a href="#" className="hover:text-primary transition-colors">
//                   Sertifikatlar
//                 </a>
//               </li>
//             </ul>
//           </div>

//           <div>
//             <h4 className="font-semibold text-foreground mb-4">Bog'lanish</h4>
//             <ul className="space-y-2 text-sm text-foreground/60">
//               <li className="font-medium text-foreground">+998 97 239 33 32</li>
//               <li>
//                 <a href="#" className="hover:text-primary transition-colors">
//                   Savollar
//                 </a>
//               </li>
//               <li>
//                 <a href="#" className="hover:text-primary transition-colors">
//                   Shartlar
//                 </a>
//               </li>
//             </ul>
//           </div>
//         </div>

//         <div className="border-t border-accent/20 pt-8">
//           <p className="text-center text-sm text-foreground/60">
//             © 2026 Harry Potter Academy. Barcha huquqlar himoyalangan.
//           </p>
//         </div>
//       </div>
//     </footer>
//   )
// }

import Image from "next/image";
import Link from "next/link"; // ← Bu qatorni qo'shing (agar loyihada yo'q bo'lsa)

export default function Footer() {
  return (
    <footer className="bg-secondary/50 border-t border-accent/20 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Yuqoridagi grid qismi o'zgarmadi */}
          <div>
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Logo"
                width={40}
                height={40}
                className="rounded-lg"
              />
              Harry Potter Academy
            </h3>
            <p className="text-sm text-foreground/60">Bilimga to'la tarbiya va zamonavoy usullar</p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Kurslar</h4>
            <ul className="space-y-2 text-sm text-foreground/60">
              <li><a href="#" className="hover:text-primary transition-colors">Ingliz tili</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Rus tili</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Turk tili</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Koreys tili</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Fanlar</h4>
            <ul className="space-y-2 text-sm text-foreground/60">
              <li><a href="#" className="hover:text-primary transition-colors">Kimyo</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Biologiya</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Sertifikatlar</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Bog'lanish</h4>
            <ul className="space-y-2 text-sm text-foreground/60">
              <li className="font-medium text-foreground">+998 97 239 33 32</li>
              <li><a href="#" className="hover:text-primary transition-colors">Savollar</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Shartlar</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-accent/20 pt-8 w-full  ">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-center text-sm text-foreground/60">
            <p>
              © 2026 Harry Potter Academy. Barcha huquqlar himoyalangan.
            </p>

            {/* Creative yaratuvchi qismi */}
            <p className="flex items-center gap-2">
              Sayt yaratuvchisi:{" "}
              <Link
                href="https://team.muhammadxon.uz/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:text-primary/80 transition-colors duration-300 group inline-flex items-center gap-1"
              >
                UzDevs
                <span className="text-xs opacity-70 group-hover:opacity-100 transition-opacity">
                  ↗
                </span>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}