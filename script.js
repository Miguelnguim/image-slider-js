// script.js
/**
 * Modern Image Slider - Vanilla JS
 * Auteur : Développeur Frontend Senior
 * Fonctionnalités :
 * - Loop infini sans saut visible (clones first/last)
 * - Auto-play configurable
 * - Pause au survol
 * - Swipe tactile (mobile)
 * - Navigation clavier
 * - Lazy loading natif
 * - Animations fluides avec translateX
 * - Code modulaire et commenté
 */

document.addEventListener('DOMContentLoaded', () => {
    // ==================== CONFIGURATION ====================
    const CONFIG = {
        autoPlay: true,
        autoPlayDelay: 4500,        // ms
        transitionDuration: 600,    // ms
        pauseOnHover: true,
        swipeThreshold: 80,         // px pour déclencher le swipe
    }

    // ==================== SÉLECTION DES ÉLÉMENTS ====================
    const sliderWrapper = document.getElementById('slider')
    const slidesContainer = document.getElementById('slides-container')
    const prevBtn = document.getElementById('prev-btn')
    const nextBtn = document.getElementById('next-btn')
    const dotsContainer = document.getElementById('dots')

    let slides = slidesContainer.querySelectorAll('.slide')
    let originalCount = slides.length
    let currentIndex = 1                     // On commence sur la première vraie slide (après clone last)
    let isTransitioning = false
    let autoPlayInterval = null
    let touchStartX = 0
    let touchEndX = 0

    // ==================== SETUP DU LOOP INFINI ====================
    function setupInfiniteLoop() {
        if (originalCount < 2) return

        // Clone de la dernière slide → inséré au début
        const lastClone = slides[originalCount - 1].cloneNode(true)
        // Clone de la première slide → inséré à la fin
        const firstClone = slides[0].cloneNode(true)

        slidesContainer.prepend(lastClone)
        slidesContainer.append(firstClone)

        // Mise à jour de la liste des slides (inclut maintenant les clones)
        slides = slidesContainer.querySelectorAll('.slide')

        // Position initiale : première vraie slide
        currentIndex = 1
        slidesContainer.style.transition = 'none'
        slidesContainer.style.transform = `translateX(-${currentIndex * 100}%)`
    }

    // ==================== TRANSFORMATION DU SLIDER ====================
    function updateSlider(withTransition = true) {
        if (withTransition) {
            slidesContainer.style.transition = `transform ${CONFIG.transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`
        } else {
            slidesContainer.style.transition = 'none'
        }
        slidesContainer.style.transform = `translateX(-${currentIndex * 100}%)`
    }

    // ==================== CALCUL DE L'INDEX ORIGINAL ====================
    function getOriginalIndex(idx) {
        return ((idx - 1) % originalCount + originalCount) % originalCount
    }

    // ==================== MISE À JOUR DES DOTS ====================
    function updateDots() {
        const dots = dotsContainer.querySelectorAll('.dot')
        const activeOriginal = getOriginalIndex(currentIndex)
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === activeOriginal)
        })
    }

    // ==================== CRÉATION DES DOTS ====================
    function createDots() {
        dotsContainer.innerHTML = ''
        for (let i = 0; i < originalCount; i++) {
            const dot = document.createElement('button')
            dot.className = 'dot'
            if (i === 0) dot.classList.add('active')
            dot.setAttribute('aria-label', `Aller à l'image ${i + 1}`)
            
            dot.addEventListener('click', () => {
                if (isTransitioning) return
                isTransitioning = true
                currentIndex = i + 1
                updateDots()
                updateSlider(true)
            })
            dotsContainer.appendChild(dot)
        }
    }

    // ==================== NAVIGATION ====================
    function nextSlide() {
        if (isTransitioning) return
        isTransitioning = true
        currentIndex++
        updateDots()
        updateSlider(true)
    }

    function prevSlide() {
        if (isTransitioning) return
        isTransitioning = true
        currentIndex--
        updateDots()
        updateSlider(true)
    }

    // Gestion du retour seamless après transition
    function handleTransitionEnd() {
        const totalWithClones = originalCount + 2

        if (currentIndex === totalWithClones - 1) {           // On est sur le clone de la première slide
            currentIndex = 1
            updateSlider(false)
        } else if (currentIndex === 0) {                      // On est sur le clone de la dernière slide
            currentIndex = originalCount
            updateSlider(false)
        }
        isTransitioning = false
    }

    // ==================== AUTO-PLAY ====================
    function startAutoPlay() {
        if (!CONFIG.autoPlay) return
        stopAutoPlay()
        autoPlayInterval = setInterval(() => {
            nextSlide()
        }, CONFIG.autoPlayDelay)
    }

    function stopAutoPlay() {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval)
            autoPlayInterval = null
        }
    }

    // ==================== GESTION DU HOVER ====================
    function initHoverPause() {
        if (!CONFIG.pauseOnHover) return
        sliderWrapper.addEventListener('mouseenter', stopAutoPlay)
        sliderWrapper.addEventListener('mouseleave', startAutoPlay)
    }

    // ==================== SWIPE TACTILE ====================
    function initTouchSwipe() {
        slidesContainer.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX
        }, { passive: true })

        slidesContainer.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX
            const diff = touchStartX - touchEndX

            if (Math.abs(diff) < CONFIG.swipeThreshold || isTransitioning) return

            if (diff > 0) {
                nextSlide()   // swipe gauche → suivant
            } else {
                prevSlide()   // swipe droite → précédent
            }
        }, { passive: true })
    }

    // ==================== NAVIGATION CLAVIER ====================
    function initKeyboard() {
        document.addEventListener('keydown', e => {
            if (document.activeElement.tagName === 'BUTTON') return
            if (e.key === 'ArrowRight') nextSlide()
            if (e.key === 'ArrowLeft') prevSlide()
        })
    }

    // ==================== INITIALISATION ====================
    function init() {
        setupInfiniteLoop()
        createDots()
        updateDots()

        // Écouteurs boutons
        prevBtn.addEventListener('click', prevSlide)
        nextBtn.addEventListener('click', nextSlide)

        // Transition end pour le loop infini
        slidesContainer.addEventListener('transitionend', handleTransitionEnd)

        // Auto-play & pause
        initHoverPause()
        startAutoPlay()

        // Interactions mobiles & clavier
        initTouchSwipe()
        initKeyboard()

        console.log('%c✅ Modern Image Slider initialisé avec succès', 'color:#10b981; font-weight:600')
    }

    // Lancement
    init()
})