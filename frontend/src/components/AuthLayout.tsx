import type { ReactNode } from "react";
import supermarketLogo from "../assets/supermarket.svg";
import "../styles/authLayout.css";

function GroceryIllustration() {
    return (
        <svg className="auth-groceries" viewBox="0 0 520 330" fill="none" aria-hidden="true">
            <ellipse cx="265" cy="295" rx="176" ry="17" fill="#D6E8DC" />
            <circle cx="270" cy="158" r="126" fill="#E1EFE5" />
            <path d="M115 250C83 227 82 186 101 169C125 178 135 209 115 250Z" fill="#ADCDB8" />
            <path d="M111 249C116 218 101 188 82 186C64 210 79 240 111 249Z" fill="#C1DAC9" />
            <g transform="rotate(-17 215 150)">
                <rect x="183" y="39" width="54" height="161" rx="27" fill="#D9AA72" />
                <path d="M196 65L215 79M192 94L213 108M190 124L211 138" stroke="#F5D6AE" strokeWidth="7" strokeLinecap="round" />
            </g>
            <path d="M298 137C284 101 304 76 326 94C337 65 371 78 369 105C405 100 412 134 384 148L340 174Z" fill="#428B5C" />
            <path d="M333 164C318 141 326 114 347 103M345 151L373 122" stroke="#83B58E" strokeWidth="4" strokeLinecap="round" />
            <g transform="rotate(12 284 150)">
                <path d="M259 94L269 80H301L312 94V192H259V94Z" fill="#FCFDFC" stroke="#C3D8CB" strokeWidth="2" />
                <path d="M269 80V64H301V80" fill="#DCECE2" />
                <rect x="269" y="60" width="32" height="8" rx="3" fill="#2B7350" />
                <path d="M260 122H311V167H260V122Z" fill="#DCEEE2" />
                <path d="M278 145C278 138 285 133 285 133C285 133 292 138 292 145C292 155 278 155 278 145Z" fill="#38805A" />
            </g>
            <path d="M156 147H370L352 282C351 291 344 296 335 296H191C182 296 175 291 174 282L156 147Z" fill="#F8FBF8" stroke="#B8D1C1" strokeWidth="2" />
            <path d="M157 148H370L366 170H160L157 148Z" fill="#E9F1EA" />
            <path d="M219 172V192C219 216 233 231 263 231C293 231 307 216 307 192V172" stroke="#2B7350" strokeWidth="7" strokeLinecap="round" />
            <path d="M248 256C249 242 263 241 276 243C276 258 264 267 248 256Z" fill="#4B9166" />
            <path d="M250 257L265 249" stroke="#DDEEE1" strokeWidth="2" strokeLinecap="round" />
            <circle cx="385" cy="265" r="30" fill="#D88368" />
            <path d="M385 238C382 226 389 218 397 218" stroke="#436F4C" strokeWidth="4" strokeLinecap="round" />
            <path d="M389 236C399 222 410 228 414 235C405 244 397 243 389 236Z" fill="#6B9C73" />
            <path d="M138 275C126 245 142 231 155 237C172 227 190 246 180 267C169 289 147 294 138 275Z" fill="#81AC73" />
            <path d="M155 238L156 227" stroke="#436F4C" strokeWidth="4" strokeLinecap="round" />
            <path d="M418 174L421 183L430 186L421 189L418 198L415 189L406 186L415 183Z" fill="#8FB69C" />
            <circle cx="127" cy="117" r="4" fill="#9FC2AB" />
            <circle cx="400" cy="83" r="5" fill="#BED6C5" />
        </svg>
    );
}

export default function AuthLayout({ children, register = false }: { children: ReactNode; register?: boolean }) {
    return (
        <div className={`auth-page${register ? " auth-page--register" : ""}`}>
            <header className="auth-brand">
                <img src={supermarketLogo} alt="" width={38} height={38} />
                <span>Supermarket</span>
            </header>
            <main className="auth-shell">
                <aside className="auth-story" aria-label="Shopping features">
                    <h2>Online shopping</h2>
                    <p>Welcome back, we are ready for you!</p>
                    <GroceryIllustration />
                </aside>
                <div className="auth-form-panel">{children}</div>
            </main>
        </div>
    );
}
