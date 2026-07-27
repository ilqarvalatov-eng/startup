import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    updateProfile,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import { 
    getFirestore, 
    doc, 
    setDoc,
    getDoc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCfF_Dyd74CGr-e81xQdxyCNMQB666sKmc",
  authDomain: "formstartup-a5fef.firebaseapp.com",
  projectId: "formstartup-a5fef",
  storageBucket: "formstartup-a5fef.firebasestorage.app",
  messagingSenderId: "866512844561",
  appId: "1:866512844561:web:53a51c4fde8d1ca34ebeb0",
  measurementId: "G-741CRYZI1J"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {

    // --- QARANLIQ REJİM ---
    const themeBtn = document.getElementById("toggle-theme-btn");
    if (themeBtn) {
        themeBtn.addEventListener("click", () => {
            document.body.classList.toggle("dark-mode");
            themeBtn.textContent = document.body.classList.contains("dark-mode") ? "☀️ Açıq Rejim" : "🌙 Qaranlıq Rejim";
        });
    }

    // --- ŞİFRƏ GÖSTƏR/GİZLƏT ---
    const togglePassBtn = document.getElementById("toggle-password");
    if (togglePassBtn) {
        togglePassBtn.addEventListener("click", () => {
            const passInput = document.getElementById("login-password") || document.getElementById("password");
            if (passInput) {
                if (passInput.type === "password") {
                    passInput.type = "text";
                    togglePassBtn.textContent = "🙈";
                } else {
                    passInput.type = "password";
                    togglePassBtn.textContent = "👁️";
                }
            }
        });
    }

    // --- QEYDİYYAT HİSSƏSİ ---
    const registerForm = document.getElementById("register-form");
    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const fullname = document.getElementById("fullname") ? document.getElementById("fullname").value : "";
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            const phone = document.getElementById("phone") ? document.getElementById("phone").value : "";

            const submitBtn = registerForm.querySelector('button[type="submit"]');
            submitBtn.textContent = "Qeydiyyat edilir...";
            submitBtn.disabled = true;

            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                await updateProfile(user, { displayName: fullname });

                await setDoc(doc(db, "users", user.uid), {
                    fullname: fullname,
                    email: email,
                    phone: phone,
                    createdAt: new Date()
                });

                window.location.href = "tesekkur.html";
            } catch (error) {
                alert("Qeydiyyat xətası: " + error.message);
                submitBtn.textContent = "Qeydiyyatdan Keç";
                submitBtn.disabled = false;
            }
        });
    }

    // --- GİRİŞ HİSSƏSİ ---
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = document.getElementById("login-email").value;
            const password = document.getElementById("login-password").value;
            const submitBtn = loginForm.querySelector('button[type="submit"]');

            submitBtn.textContent = "Giriş edilir...";
            submitBtn.disabled = true;

            try {
                await signInWithEmailAndPassword(auth, email, password);
                window.location.href = "main.html";
            } catch (error) {
                alert("E-poçt və ya şifrə yanlışdır!");
                submitBtn.textContent = "Daxil Ol";
                submitBtn.disabled = false;
            }
        });
    }

    // --- MAIN.HTML VƏ PROFİL PƏNCƏRƏSİ (MODAL) ---
    const userNameSpan = document.getElementById("user-name");
    const navUserName = document.getElementById("nav-user-name");
    const avatarInitials = document.getElementById("avatar-initials");
    const modalAvatarInitials = document.getElementById("modal-avatar-initials");
    const modalUserFullname = document.getElementById("modal-user-fullname");
    const modalUserEmail = document.getElementById("modal-user-email");
    const modalUserPhone = document.getElementById("modal-user-phone");

    const profileModal = document.getElementById("profile-modal");
    const openProfileBtn = document.getElementById("open-profile-btn");
    const closeProfileBtn = document.getElementById("close-profile-btn");
    const logoutBtn = document.getElementById("logout-btn");

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            try {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                let fullname = user.displayName || "İstifadəçi";
                let phone = "Təyin edilməyib";

                if (userDoc.exists()) {
                    const data = userDoc.data();
                    if (data.fullname) fullname = data.fullname;
                    if (data.phone) phone = data.phone;
                }

                // Ad və Baş hərfi təyin edirik
                const initial = fullname.charAt(0).toUpperCase();

                if (userNameSpan) userNameSpan.textContent = fullname;
                if (navUserName) navUserName.textContent = fullname;
                if (avatarInitials) avatarInitials.textContent = initial;
                if (modalAvatarInitials) modalAvatarInitials.textContent = initial;
                if (modalUserFullname) modalUserFullname.textContent = fullname;
                if (modalUserEmail) modalUserEmail.textContent = user.email;
                if (modalUserPhone) modalUserPhone.textContent = phone;

            } catch (err) {
                console.error(err);
            }
        } else {
            if (window.location.pathname.includes("main.html")) {
                window.location.href = "login.html";
            }
        }
    });

    // Profil Modalını Aç/Bağla
    if (openProfileBtn && profileModal) {
        openProfileBtn.addEventListener("click", () => profileModal.classList.add("active"));
    }
    if (closeProfileBtn && profileModal) {
        closeProfileBtn.addEventListener("click", () => profileModal.classList.remove("active"));
    }

    // Çıxış Düyməsi
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            signOut(auth).then(() => {
                window.location.href = "login.html";
            });
        });
    }
});