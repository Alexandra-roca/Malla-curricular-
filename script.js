// Espera a que todo el contenido del DOM (la página HTML) se haya cargado antes de ejecutar el script.
document.addEventListener('DOMContentLoaded', () => {

    // Selecciona todos los elementos que representan un ramo.
    const ramos = document.querySelectorAll('.ramo');
    // Clave que usaremos para guardar y recuperar los datos del localStorage.
    const LOCAL_STORAGE_KEY = 'ramosAprobados';

    /**
     * Carga el estado de los ramos aprobados desde el localStorage.
     * @returns {string[]} Un array con los IDs de los ramos aprobados.
     */
    function cargarRamosAprobados() {
        const ramosGuardados = localStorage.getItem(LOCAL_STORAGE_KEY);
        // Si hay datos guardados, los convierte de string a array. Si no, devuelve un array vacío.
        return ramosGuardados ? JSON.parse(ramosGuardados) : [];
    }

    /**
     * Guarda un array de IDs de ramos aprobados en el localStorage.
     * @param {string[]} aprobados - El array de IDs de ramos aprobados.
     */
    function guardarRamosAprobados(aprobados) {
        // Convierte el array a un string JSON y lo guarda.
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(aprobados));
    }

    /**
     * Actualiza el estado visual de todos los ramos (aprobado, bloqueado, normal).
     * Esta función es clave y se ejecuta al inicio y cada vez que se hace un cambio.
     */
    function actualizarEstadoVisual() {
        const aprobados = cargarRamosAprobados();

        ramos.forEach(ramo => {
            const ramoId = ramo.id;
            const requisitos = ramo.dataset.requisitos ? ramo.dataset.requisitos.split(',') : [];

            // 1. Aplicar estado "aprobado" si corresponde.
            if (aprobados.includes(ramoId)) {
                ramo.classList.add('aprobado');
                ramo.classList.remove('bloqueado'); // Un ramo aprobado nunca puede estar bloqueado.
            } else {
                ramo.classList.remove('aprobado');

                // 2. Verificar si el ramo debe estar "bloqueado".
                // Un ramo se bloquea si tiene requisitos y no todos están aprobados.
                let bloqueado = false;
                if (requisitos.length > 0) {
                    // La función `every` comprueba si TODOS los requisitos cumplen la condición.
                    const requisitosCumplidos = requisitos.every(reqId => aprobados.includes(reqId));
                    if (!requisitosCumplidos) {
                        bloqueado = true;
                    }
                }

                if (bloqueado) {
                    ramo.classList.add('bloqueado');
                } else {
                    ramo.classList.remove('bloqueado');
                }
            }
        });
    }

    /**
     * Maneja el evento de clic en un ramo.
     * @param {Event} e - El objeto del evento de clic.
     */
    function manejarClicRamo(e) {
        const ramo = e.currentTarget;
        const ramoId = ramo.id;

        // Si el ramo está bloqueado, muestra una alerta y no hace nada más.
        if (ramo.classList.contains('bloqueado')) {
            const requisitos = ramo.dataset.requisitos.split(',');
            const aprobados = cargarRamosAprobados();
            
            // Filtra para encontrar los requisitos que aún no han sido aprobados.
            const faltantes = requisitos.filter(reqId => !aprobados.includes(reqId));
            
            // Busca el texto (nombre) de cada ramo faltante para mostrarlo en el mensaje.
            const nombresFaltantes = faltantes.map(reqId => {
                const reqElemento = document.getElementById(reqId);
                return reqElemento ? reqElemento.textContent : reqId;
            });
            
            // Muestra la alerta al usuario.
            alert(`No puedes aprobar este ramo. \nRequisitos pendientes: \n- ${nombresFaltantes.join('\n- ')}`);
            return;
        }

        // Si no está bloqueado, cambia su estado (aprueba o desaprueba).
        let aprobados = cargarRamosAprobados();
        if (aprobados.includes(ramoId)) {
            // Si ya estaba aprobado, lo quitamos (desaprobar).
            aprobados = aprobados.filter(id => id !== ramoId);
        } else {
            // Si no estaba aprobado, lo añadimos.
            aprobados.push(ramoId);
        }

        // Guarda el nuevo estado en localStorage.
        guardarRamosAprobados(aprobados);
        // Actualiza la apariencia de todos los ramos para reflejar el cambio.
        actualizarEstadoVisual();
    }

    // --- INICIALIZACIÓN ---

    // Añade el detector de eventos de clic a cada ramo.
    ramos.forEach(ramo => {
        ramo.addEventListener('click', manejarClicRamo);
    });

    // Llama a la función de actualización visual por primera vez al cargar la página.
    // Esto asegura que los ramos guardados se marquen como aprobados y se bloqueen los que correspondan.
    actualizarEstadoVisual();
});
