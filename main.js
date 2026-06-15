document.addEventListener("DOMContentLoaded", () => {
    const proyectosImagenes = {
        "images/sedia1": ["sedia1_a.jpg", "sedia1_c.jpg", "sedia1_d.jpg", "sedia1_plano.png"],
        "images/mesa1": ["mesa1_a.jpg", "mesa1_c.jpg", "mesa1_d.jpg", "mesa1_plano.png", "mesa1_ref.png"],
        "images/mesa2": ["mesa2_a.jpg", "mesa2_b.jpg", "mesa2_d.jpg", "mesa2_plano.png", "mesa2_ref.png"],
        "images/estanteria": ["estanteria_1.jpg", "estanteria_2.jpg", "estanteria_3.jpg", "estanteria_foto.png", "estanteria_plano.png"]
    };

    const buttons = document.querySelectorAll(".tag-btn");
    const viewer = document.getElementById("images-viewer");
    const rightPanel = document.getElementById("panel-right-scroll");
    
    // Selectores para los degradados de los bordes
    const fadeTop = document.querySelector(".fade-top");
    const fadeBottom = document.querySelector(".fade-bottom");

    // Configuración del motor de scroll
    let scrollSpeed = 0.4; 
    let returnSpeed = 4; // Velocidad de regreso hacia arriba (más alto = más rápido)
    let isUserInteracting = false;
    let isWaiting = false;
    let scrollDirection = 1; // 1 = Hacia abajo, -1 = Hacia arriba
    let timeoutId = null;

    // Función para controlar la visibilidad inteligente de los degradados
    function actualizarFades() {
        const currentScroll = rightPanel.scrollTop;
        const maxScroll = rightPanel.scrollHeight - rightPanel.clientHeight;

        // Control del fade superior (Aparece solo si te despegas del techo)
        if (currentScroll <= 5) {
            fadeTop.style.opacity = "0";
        } else {
            fadeTop.style.opacity = "1";
        }

        // Control del fade inferior (Se oculta si tocas el fondo)
        if (currentScroll >= maxScroll - 5) {
            fadeBottom.style.opacity = "0";
        } else {
            fadeBottom.style.opacity = "1";
        }
    }

    // Escuchar el movimiento manual del usuario para actualizar los fades en tiempo real
    rightPanel.addEventListener("scroll", actualizarFades);

    function autoScroll() {
        if (!isUserInteracting && !isWaiting) {
            const maxScroll = rightPanel.scrollHeight - rightPanel.clientHeight;

            if (scrollDirection === 1) {
                // Avanzar hacia abajo lentamente
                rightPanel.scrollTop += scrollSpeed;

                // Detectar si llegó al fondo
                if (rightPanel.scrollTop >= maxScroll - 1) {
                    isWaiting = true;
                    actualizarFades(); // Asegurar que apague el fade inferior en la pausa
                    setTimeout(() => {
                        scrollDirection = -1; // Cambiar dirección hacia arriba
                        isWaiting = false;
                    }, 3000); // Pausa de 3 segundos abajo
                }
            } else {
                // Regresar hacia arriba de manera fluida y continua
                rightPanel.scrollTop -= returnSpeed;

                // Detectar si regresó al inicio
                if (rightPanel.scrollTop <= 0) {
                    isWaiting = true;
                    actualizarFades(); // Asegurar que apague el fade superior en la pausa
                    setTimeout(() => {
                        scrollDirection = 1; // Cambiar dirección hacia abajo
                        isWaiting = false;
                    }, 2000); // Pausa opcional de 2 segundos arriba antes de volver a bajar
                }
            }
        }
        requestAnimationFrame(autoScroll);
    }

    // Interrupción por interacción del usuario (Mouse o táctil)
    function detenerScrollTemporal() {
        isUserInteracting = true;
        clearTimeout(timeoutId);
        
        timeoutId = setTimeout(() => {
            isUserInteracting = false;
            // Al retomar el scroll automático, evalúa hacia dónde iba para no perder el hilo
            const maxScroll = rightPanel.scrollHeight - rightPanel.clientHeight;
            scrollDirection = (rightPanel.scrollTop >= maxScroll - 10) ? -1 : 1;
        }, 4000); // 4 segundos de espera tras soltar el control manual
    }

    rightPanel.addEventListener('wheel', detenerScrollTemporal, { passive: true });
    rightPanel.addEventListener('touchstart', detenerScrollTemporal, { passive: true });

    function cargarProyecto(folderPath, projectLink) {
        viewer.innerHTML = "";
        
        if (!folderPath || !proyectosImagenes[folderPath]) {
            viewer.innerHTML = "<p class='no-data'>Proyecto en desarrollo.</p>";
            return;
        }

        rightPanel.scrollTop = 0;
        scrollDirection = 1; // Resetear dirección al cambiar de proyecto
        actualizarFades();

        const imagenes = proyectosImagenes[folderPath];

        imagenes.forEach(imgName => {
            const linkWrapper = document.createElement("a");
            linkWrapper.href = projectLink;
            linkWrapper.className = "scroll-image-link";

            const img = document.createElement("img");
            img.src = `${folderPath}/${imgName}`;
            img.alt = "MOCap Portafolio";
            img.className = "portfolio-scroll-img";

            linkWrapper.appendChild(img);
            viewer.appendChild(linkWrapper);
        });
    }

    // Inicialización de la interfaz
    cargarProyecto("images/sedia1", "sedia1.html");
    autoScroll();

    buttons.forEach(button => {
        button.addEventListener("click", () => {
            if (button.classList.contains("placeholder-btn")) return;
            
            buttons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");

            const folder = button.getAttribute("data-folder");
            const link = button.getAttribute("data-link");

            cargarProyecto(folder, link);
        });
    });
});