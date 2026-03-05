/**
 * NIMBUS PRIME - Architecture of Elegance
 * Core Interactive Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    initThreeJS();
    initThemeSwitcher();
    initSimulator();
    initAnimations();
});

// --- Three.js Background (Abstract 3D Nodes) ---
function initThreeJS() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    const scene = new THREE.Scene();

    // Add subtle fog to blend into the dark background
    scene.fog = new THREE.FogExp2(0x0a0a0f, 0.001);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create a central geometric core (Icosahedron)
    const geoGeometry = new THREE.IcosahedronGeometry(10, 1);
    const geoMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: 0.1
    });
    const core = new THREE.Mesh(geoGeometry, geoMaterial);
    scene.add(core);

    // Create particles (Stars/Data nodes)
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1000;

    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 100;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.1,
        color: 0x4a9eff, // Default accent
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Make material globally accessible for theme switching
    window.particlesMaterial = particlesMaterial;

    // Mouse interaction variables
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX) * 0.0005;
        mouseY = (event.clientY - windowHalfY) * 0.0005;
    });

    // Animation Loop
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        // Smoothly interpolate target rotation
        targetX = mouseX * 0.5;
        targetY = mouseY * 0.5;

        // Rotate core
        core.rotation.y += 0.002;
        core.rotation.x += 0.001;

        // Rotate particles slowly and react to mouse
        particlesMesh.rotation.y += 0.0005;
        particlesMesh.rotation.x += 0.0002;

        // Parallax effect
        camera.position.x += (mouseX * 5 - camera.position.x) * 0.05;
        camera.position.y += (-mouseY * 5 - camera.position.y) * 0.05;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
    }

    animate();

    // Handle Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// --- Theme Switcher ---
function initThemeSwitcher() {
    const buttons = document.querySelectorAll('.theme-btn');
    const body = document.body;

    // Load saved theme
    const savedTheme = localStorage.getItem('nimbus-theme') || 'void';
    applyTheme(savedTheme);

    buttons.forEach(btn => {
        if (btn.dataset.color === savedTheme) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }

        btn.addEventListener('click', () => {
            const theme = btn.dataset.color;

            // Update active state
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            applyTheme(theme);
            localStorage.setItem('nimbus-theme', theme);
        });
    });

    function applyTheme(theme) {
        body.setAttribute('data-theme', theme);

        // Update Three.js particle colors
        if (window.particlesMaterial) {
            let colorHex = 0x4a9eff; // Default Void
            if (theme === 'emerald') colorHex = 0x10b981;
            if (theme === 'ruby') colorHex = 0xf43f5e;
            if (theme === 'amethyst') colorHex = 0xa855f7;

            // Animate color change using GSAP for smoothness
            const targetColor = new THREE.Color(colorHex);
            gsap.to(window.particlesMaterial.color, {
                r: targetColor.r,
                g: targetColor.g,
                b: targetColor.b,
                duration: 1
            });
        }
    }
}

// --- Live Spec Simulator ---
function initSimulator() {
    const ramSlider = document.getElementById('ram-slider');
    const cpuSlider = document.getElementById('cpu-slider');

    const ramVal = document.getElementById('ram-val');
    const cpuVal = document.getElementById('cpu-val');

    const simProfile = document.getElementById('sim-profile');
    const simFlags = document.getElementById('sim-flags');

    function updateSimulation() {
        const ram = parseInt(ramSlider.value);
        const cpu = parseInt(cpuSlider.value);

        // Update UI labels
        ramVal.textContent = ram;
        cpuVal.textContent = cpu;

        // Calculate dynamic values
        let profile = "Entry-Level";
        if (ram >= 16 && cpu >= 8) profile = "High-End";
        else if (ram >= 8 && cpu >= 4) profile = "Mid-Tier";
        else if (ram >= 32 && cpu >= 16) profile = "Enthusiast";

        // Generate mock flags mimicking Hardware Auditor behavior
        const xms = Math.floor((ram * 1024) * 0.25); // 25% of RAM
        const xmx = Math.floor((ram * 1024) * 0.50); // 50% of RAM max
        const threads = Math.max(2, Math.floor(cpu * 0.75));

        simProfile.textContent = profile;
        simFlags.textContent = `-Xms${xms}M -Xmx${xmx}M -XX:+UseG1GC -XX:ParallelGCThreads=${threads} -XX:MaxGCPauseMillis=50`;

        // Trigger a tiny flash on the flags block
        gsap.fromTo(simFlags,
            { opacity: 0.5, filter: 'brightness(2)' },
            { opacity: 1, filter: 'brightness(1)', duration: 0.4 }
        );
    }

    ramSlider.addEventListener('input', updateSimulation);
    cpuSlider.addEventListener('input', updateSimulation);

    // Initial call
    updateSimulation();
}

// --- GSAP Scroll Animations ---
function initAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    // Reveal cards on scroll with stagger and ScrollTrigger
    const cards = gsap.utils.toArray('.feature-card, .performance-card, .simulator-card');

    cards.forEach(card => {
        gsap.fromTo(card,
            { y: 60, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 1,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: card,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    });

    // Hero element reveals
    gsap.fromTo(".hero-badge", { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, delay: 0.2 });
    gsap.fromTo(".hero-title", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: 0.4, ease: "power3.out" });
    gsap.fromTo(".hero-subtitle", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, delay: 0.6 });
    gsap.fromTo(".cta-group", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, delay: 0.8 });

    // Giant text parallax and glow reveal
    gsap.fromTo(".giant-text",
        {
            y: 100,
            opacity: 0,
            scale: 0.9,
            filter: "blur(10px)"
        },
        {
            y: 0,
            opacity: 1,
            scale: 1,
            filter: "blur(0px)",
            duration: 1.5,
            ease: "power3.out",
            scrollTrigger: {
                trigger: ".giant-brand-section",
                start: "top 90%",
                end: "bottom 80%",
                scrub: 1
            }
        }
    );
}
