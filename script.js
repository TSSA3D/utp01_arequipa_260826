import * as THREE from "three";

import {
    OrbitControls
} from "three/addons/controls/OrbitControls.js";

import {
    GLTFLoader
} from "three/addons/loaders/GLTFLoader.js";

import {
    DRACOLoader
} from "three/addons/loaders/DRACOLoader.js";


// ======================================================
// ESCENA
// ======================================================

const scene =
    new THREE.Scene();

scene.background =
    new THREE.Color(0x202020);


// ======================================================
// CÁMARA
// ======================================================

const camera =
    new THREE.PerspectiveCamera(

        45,

        window.innerWidth /
        window.innerHeight,

        0.1,

        5000

    );

camera.position.set(
    4,
    3,
    6
);


// ======================================================
// RENDER
// ======================================================

const renderer =
    new THREE.WebGLRenderer({

        antialias: true,

        powerPreference:
            "high-performance"

    });

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setPixelRatio(
    Math.min(
        window.devicePixelRatio,
        2
    )
);

document.body.appendChild(
    renderer.domElement
);


// ======================================================
// CONTROLES
// ======================================================

const controls =
    new OrbitControls(

        camera,

        renderer.domElement

    );

controls.enableDamping =
    true;

controls.dampingFactor =
    0.05;

controls.target.set(
    0,
    0,
    0
);

controls.minDistance =
    20;

controls.maxDistance =
    400;

controls.maxPolarAngle =
    Math.PI / 2;


// ======================================================
// LUCES
// ======================================================

const ambient =
    new THREE.AmbientLight(
        0xffffff,
        2
    );

scene.add(
    ambient
);

const directional =
    new THREE.DirectionalLight(
        0xffffff,
        4
    );

directional.position.set(
    10,
    10,
    10
);

scene.add(
    directional
);


// ======================================================
// DRACO
// ======================================================

const dracoLoader =
    new DRACOLoader();

dracoLoader.setDecoderPath(
    "https://www.gstatic.com/draco/versioned/decoders/1.5.7/"
);

const loader =
    new GLTFLoader();

loader.setDRACOLoader(
    dracoLoader
);


// ======================================================
// VARIABLES DEL MODELO
// ======================================================

let modelo = null;

let distanciaInicial = 10;


// ======================================================
// SISTEMA DE MEDICIÓN
// ======================================================

const raycaster =
    new THREE.Raycaster();

const mouse =
    new THREE.Vector2();

let modoMedicion =
    false;

let modoArea =
    false;

let modoEdicion =
    false;

let primerPunto =
    null;

let marcadorPrimerPunto =
    null;

let puntosArea =
    [];

let marcadoresArea =
    [];

let lineaTemporal =
    null;

let mediciones =
    [];

let medicionSeleccionada =
    null;

let puntoArrastrando =
    null;

let indicePuntoArrastrando =
    -1;

let medicionArrastrando =
    null;

let arrastrando =
    false;


// ======================================================
// HISTORIAL
// ======================================================

const historialEliminaciones =
    [];


// ======================================================
// CARGAR MODELO
// ======================================================

loader.load(

    "modelo/utp_260826.gltf",

    function(gltf) {

        console.log(
            "Modelo cargado correctamente"
        );

        modelo =
            gltf.scene;

        scene.add(
            modelo
        );


        const box =
            new THREE.Box3()
                .setFromObject(
                    modelo
                );


        const center =
            box.getCenter(
                new THREE.Vector3()
            );


        const size =
            box.getSize(
                new THREE.Vector3()
            );


        modelo.position.sub(
            center
        );


        const maxDim =
            Math.max(

                size.x,
                size.y,
                size.z

            );


        const distancia =
            maxDim * 1.0;


        distanciaInicial =
            distancia;


        camera.position.set(

            distancia,

            distancia * 0.8,

            distancia

        );


        camera.near =
            0.1;

        camera.far =
            maxDim * 50;

        camera.updateProjectionMatrix();


        controls.target.set(
            0,
            0,
            0
        );

        controls.update();


        console.log(
            "Dimensiones del modelo:"
        );

        console.log(
            "X:",
            size.x.toFixed(2)
        );

        console.log(
            "Y:",
            size.y.toFixed(2)
        );

        console.log(
            "Z:",
            size.z.toFixed(2)
        );

    },

    undefined,

    function(error) {

        console.error(
            "Error cargando modelo:",
            error
        );

    }

);


// ======================================================
// GRILLA
// ======================================================

const grid =
    new THREE.GridHelper(

        10,
        10,
        0xffffff,
        0x666666

    );

grid.position.y =
    -12;

scene.add(
    grid
);


// ======================================================
// EJES
// ======================================================

const axes =
    new THREE.AxesHelper(
        3
    );

axes.position.y =
    -12;

scene.add(
    axes
);


// ======================================================
// ELEMENTOS HTML
// ======================================================

const btnInfo =
    document.getElementById(
        "btnInfo"
    );

const panelInfo =
    document.getElementById(
        "panelInfo"
    );

const btnMedir =
    document.getElementById(
        "btnMedir"
    );

const btnArea =
    document.getElementById(
        "btnArea"
    );

const btnEditar =
    document.getElementById(
        "btnEditar"
    );

const btnEliminar =
    document.getElementById(
        "btnEliminar"
    );

const btnLimpiar =
    document.getElementById(
        "btnLimpiar"
    );

const btnDeshacer =
    document.getElementById(
        "btnDeshacer"
    );

const btnGrilla =
    document.getElementById(
        "btnGrilla"
    );

const btnEjes =
    document.getElementById(
        "btnEjes"
    );

const btnCentrar =
    document.getElementById(
        "btnCentrar"
    );

const btnVista =
    document.getElementById(
        "btnVista"
    );

const btnFullscreen =
    document.getElementById(
        "btnFullscreen"
    );

const listaMediciones =
    document.getElementById(
        "listaMediciones"
    );

const sinMediciones =
    document.getElementById(
        "sinMediciones"
    );

const estadoEdicion =
    document.getElementById(
        "estadoEdicion"
    );


// ======================================================
// INFORMACIÓN
// ======================================================

btnInfo.addEventListener(
    "click",
    () => {

        panelInfo.classList.toggle(
            "visible"
        );

    }
);


// ======================================================
// GRILLA
// ======================================================

btnGrilla.addEventListener(
    "click",
    () => {

        grid.visible =
            !grid.visible;

    }
);


// ======================================================
// EJES
// ======================================================

btnEjes.addEventListener(
    "click",
    () => {

        axes.visible =
            !axes.visible;

    }
);


// ======================================================
// MEDICIÓN DE DISTANCIA
// ======================================================

btnMedir.addEventListener(
    "click",
    () => {

        salirModoEdicion();


        if (modoArea) {

            cancelarArea();

        }


        modoMedicion =
            !modoMedicion;


        primerPunto =
            null;

        eliminarMarcadorPrimerPunto();


        if (modoMedicion) {

            btnMedir.classList.add(
                "activo"
            );

            btnMedir.textContent =
                "📏 Medición activa";

            renderer.domElement.style.cursor =
                "crosshair";

        } else {

            btnMedir.classList.remove(
                "activo"
            );

            btnMedir.textContent =
                "📏 Medir distancia";

            renderer.domElement.style.cursor =
                "default";

        }

    }
);


// ======================================================
// MEDICIÓN DE ÁREA
// ======================================================

btnArea.addEventListener(
    "click",
    () => {

        salirModoEdicion();


        if (modoMedicion) {

            modoMedicion =
                false;

            primerPunto =
                null;

            eliminarMarcadorPrimerPunto();

            btnMedir.classList.remove(
                "activo"
            );

            btnMedir.textContent =
                "📏 Medir distancia";

        }


        if (modoArea) {

            finalizarArea();

            return;

        }


        modoArea =
            true;

        puntosArea =
            [];

        limpiarPuntosTemporales();


        btnArea.classList.add(
            "activo"
        );

        btnArea.textContent =
            "✓ Finalizar área";


        renderer.domElement.style.cursor =
            "crosshair";

    }
);


// ======================================================
// MODO EDICIÓN
// ======================================================

btnEditar.addEventListener(
    "click",
    () => {

        if (!medicionSeleccionada) {

            alert(
                "Selecciona primero una medición de la lista."
            );

            return;

        }


        modoMedicion =
            false;

        modoArea =
            false;

        primerPunto =
            null;

        puntosArea =
            [];


        eliminarMarcadorPrimerPunto();

        limpiarPuntosTemporales();


        btnMedir.classList.remove(
            "activo"
        );

        btnArea.classList.remove(
            "activo"
        );


        btnMedir.textContent =
            "📏 Medir distancia";

        btnArea.textContent =
            "📐 Medir área";


        modoEdicion =
            !modoEdicion;


        if (modoEdicion) {

            btnEditar.classList.add(
                "activo"
            );

            btnEditar.textContent =
                "✓ Edición activa";

            estadoEdicion.classList.add(
                "visible"
            );

            renderer.domElement.style.cursor =
                "grab";

        } else {

            salirModoEdicion();

        }

    }
);


// ======================================================
// SALIR EDICIÓN
// ======================================================

function salirModoEdicion() {

    modoEdicion =
        false;

    btnEditar.classList.remove(
        "activo"
    );

    btnEditar.textContent =
        "✋ Editar puntos";

    estadoEdicion.classList.remove(
        "visible"
    );


    if (!arrastrando) {

        renderer.domElement.style.cursor =
            "default";

    }

}


// ======================================================
// CLICK SOBRE MODELO
// ======================================================

renderer.domElement.addEventListener(
    "click",
    manejarClickModelo
);


function manejarClickModelo(event) {

    if (modoEdicion) {

        return;

    }


    if (
        !modoMedicion &&
        !modoArea
    ) {

        return;

    }


    if (!modelo) {

        return;

    }


    const punto =
        obtenerPuntoModelo(event);


    if (!punto) {

        return;

    }


    if (modoMedicion) {

        medirDistancia(
            punto
        );

    }


    if (modoArea) {

        agregarPuntoArea(
            punto
        );

    }

}


// ======================================================
// OBTENER PUNTO DEL MODELO
// ======================================================

function obtenerPuntoModelo(event) {

    const rect =
        renderer.domElement
            .getBoundingClientRect();


    mouse.x =
        (
            (
                event.clientX -
                rect.left
            )
            /
            rect.width
        )
        *
        2
        -
        1;


    mouse.y =
        -(
            (
                event.clientY -
                rect.top
            )
            /
            rect.height
        )
        *
        2
        +
        1;


    raycaster.setFromCamera(
        mouse,
        camera
    );


    const intersecciones =
        raycaster.intersectObject(
            modelo,
            true
        );


    if (
        intersecciones.length === 0
    ) {

        return null;

    }


    return intersecciones[0]
        .point
        .clone();

}


// ======================================================
// DISTANCIA
// ======================================================

function medirDistancia(
    punto
) {

    if (!primerPunto) {

        primerPunto =
            punto.clone();

        crearMarcadorPrimerPunto(
            primerPunto
        );

        return;

    }


    const puntoA =
        primerPunto.clone();

    const puntoB =
        punto.clone();


    const distancia =
        puntoA.distanceTo(
            puntoB
        );


    const medicion =
        crearMedicionDistancia(

            puntoA,
            puntoB,
            distancia

        );


    mediciones.push(
        medicion
    );


    crearItemLista(
        medicion
    );


    seleccionarMedicion(
        medicion
    );


    primerPunto =
        null;

    eliminarMarcadorPrimerPunto();

}


// ======================================================
// MARCADOR TEMPORAL
// ======================================================

function crearMarcadorPrimerPunto(
    punto
) {

    eliminarMarcadorPrimerPunto();


    marcadorPrimerPunto =
        crearMarcador(
            punto
        );


    marcadorPrimerPunto
        .material
        .color
        .set(
            0xffff00
        );


    scene.add(
        marcadorPrimerPunto
    );

}


// ======================================================
// ELIMINAR MARCADOR TEMPORAL
// ======================================================

function eliminarMarcadorPrimerPunto() {

    if (!marcadorPrimerPunto) {

        return;

    }


    scene.remove(
        marcadorPrimerPunto
    );


    marcadorPrimerPunto.geometry.dispose();

    marcadorPrimerPunto.material.dispose();


    marcadorPrimerPunto =
        null;

}


// ======================================================
// CREAR DISTANCIA
// ======================================================

function crearMedicionDistancia(

    puntoA,
    puntoB,
    distancia

) {

    const grupo =
        new THREE.Group();


    grupo.userData.tipo =
        "medicion";


    const marcadorA =
        crearMarcador(
            puntoA
        );

    const marcadorB =
        crearMarcador(
            puntoB
        );


    grupo.add(
        marcadorA
    );

    grupo.add(
        marcadorB
    );


    const linea =
        new THREE.Line(

            new THREE.BufferGeometry()
                .setFromPoints([
                    puntoA,
                    puntoB
                ]),

            new THREE.LineBasicMaterial({

                color:
                    0xff0000

            })

        );


    grupo.add(
        linea
    );


    scene.add(
        grupo
    );


    const etiqueta =
        crearEtiqueta(
            distancia.toFixed(2) +
            " m"
        );


    return {

        tipo:
            "Distancia",

        valor:
            distancia,

        unidad:
            "m",

        grupo:
            grupo,

        etiqueta:
            etiqueta,

        puntos:
            [
                puntoA.clone(),
                puntoB.clone()
            ],

        marcadores:
            [
                marcadorA,
                marcadorB
            ],

        linea:
            linea,

        superficie:
            null,

        lista:
            null

    };

}


// ======================================================
// CREAR MARCADOR
// ======================================================

function crearMarcador(
    punto
) {

    const geometria =
        new THREE.SphereGeometry(
            0.10,
            16,
            16
        );


    const material =
        new THREE.MeshBasicMaterial({

            color:
                0xff0000

        });


    const marcador =
        new THREE.Mesh(

            geometria,
            material

        );


    marcador.position.copy(
        punto
    );


    marcador.userData.esPuntoMedicion =
        true;


    return marcador;

}


// ======================================================
// CREAR ETIQUETA
// ======================================================

function crearEtiqueta(
    texto
) {

    const etiqueta =
        document.createElement(
            "div"
        );


    etiqueta.className =
        "etiquetaMedicion";


    etiqueta.textContent =
        texto;


    document.body.appendChild(
        etiqueta
    );


    return etiqueta;

}


// ======================================================
// ÁREA - AGREGAR PUNTO
// ======================================================

function agregarPuntoArea(
    punto
) {

    puntosArea.push(
        punto.clone()
    );


    const marcador =
        crearMarcador(
            punto
        );


    marcador.material.color.set(
        0x00ff00
    );


    scene.add(
        marcador
    );


    marcadoresArea.push(
        marcador
    );


    actualizarPoligonoTemporal();

}


// ======================================================
// POLÍGONO TEMPORAL
// ======================================================

function actualizarPoligonoTemporal() {

    if (lineaTemporal) {

        scene.remove(
            lineaTemporal
        );

        lineaTemporal.geometry.dispose();

        lineaTemporal.material.dispose();

        lineaTemporal =
            null;

    }


    if (
        puntosArea.length < 2
    ) {

        return;

    }


    let geometria;


    if (
        puntosArea.length === 2
    ) {

        geometria =
            new THREE.BufferGeometry()
                .setFromPoints(
                    puntosArea
                );

        lineaTemporal =
            new THREE.Line(

                geometria,

                new THREE.LineBasicMaterial({

                    color:
                        0x00ff00

                })

            );

    } else {

        geometria =
            new THREE.BufferGeometry()
                .setFromPoints(
                    puntosArea
                );


        lineaTemporal =
            new THREE.LineLoop(

                geometria,

                new THREE.LineBasicMaterial({

                    color:
                        0x00ff00

                })

            );

    }


    scene.add(
        lineaTemporal
    );

}


// ======================================================
// FINALIZAR ÁREA
// ======================================================

function finalizarArea() {

    if (
        puntosArea.length < 3
    ) {

        alert(
            "Necesitas seleccionar al menos 3 puntos para calcular un área."
        );

        return;

    }


    /*
     * IMPORTANTE:
     *
     * NO se cambia el orden de los puntos.
     *
     * Se conserva exactamente:
     *
     * P0 → P1 → P2 → P3 → ... → Pn → P0
     */


    const puntos =
        puntosArea.map(
            p => p.clone()
        );


    // --------------------------------------------------
    // COMPROBAR QUE EL POLÍGONO NO SE CRUZA
    // --------------------------------------------------

    if (
        poligonoSeCruza(
            puntos
        )
    ) {

        alert(
            "El polígono se cruza consigo mismo.\n\n" +
            "Los puntos se mantienen exactamente en el orden en que fueron seleccionados.\n\n" +
            "Selecciona los puntos siguiendo el contorno del área sin cruzar las líneas."
        );

        return;

    }


    // --------------------------------------------------
    // TRIANGULACIÓN ROBUSTA
    // --------------------------------------------------

    const triangulos =
        triangularPoligono(
            puntos
        );


    if (
        !triangulos ||
        triangulos.length === 0
    ) {

        alert(
            "No se pudo triangular correctamente el polígono.\n\n" +
            "Verifica que los puntos formen un contorno válido."
        );

        return;

    }


    // --------------------------------------------------
    // CALCULAR ÁREA USANDO LOS MISMOS TRIÁNGULOS
    // --------------------------------------------------

    const area =
        calcularAreaTriangulada(

            puntos,

            triangulos

        );


    // --------------------------------------------------
    // CREAR GRUPO
    // --------------------------------------------------

    const grupo =
        new THREE.Group();


    grupo.userData.tipo =
        "medicion";


    // --------------------------------------------------
    // SUPERFICIE
    // --------------------------------------------------

    const superficie =
        crearSuperficieArea(

            puntos,

            triangulos

        );


    grupo.add(
        superficie
    );


    // --------------------------------------------------
    // LÍNEA DEL CONTORNO
    // --------------------------------------------------

    const linea =
        new THREE.LineLoop(

            new THREE.BufferGeometry()
                .setFromPoints(
                    puntos
                ),

            new THREE.LineBasicMaterial({

                color:
                    0x00ff00

            })

        );


    grupo.add(
        linea
    );


    // --------------------------------------------------
    // MARCADORES
    // --------------------------------------------------

    const marcadores =
        [];


    puntos.forEach(
        punto => {

            const marcador =
                crearMarcador(
                    punto
                );


            marcador.material.color.set(
                0x00ff00
            );


            grupo.add(
                marcador
            );


            marcadores.push(
                marcador
            );

        }
    );


    scene.add(
        grupo
    );


    // --------------------------------------------------
    // ETIQUETA
    // --------------------------------------------------

    const etiqueta =
        crearEtiqueta(

            area.toFixed(2) +
            " m²"

        );


    // --------------------------------------------------
    // OBJETO MEDICIÓN
    // --------------------------------------------------

    const medicion = {

        tipo:
            "Área",

        valor:
            area,

        unidad:
            "m²",

        grupo:
            grupo,

        etiqueta:
            etiqueta,

        puntos:
            puntos,

        marcadores:
            marcadores,

        linea:
            linea,

        superficie:
            superficie,

        triangulos:
            triangulos,

        lista:
            null

    };


    mediciones.push(
        medicion
    );


    crearItemLista(
        medicion
    );


    seleccionarMedicion(
        medicion
    );


    limpiarPuntosTemporales();


    puntosArea =
        [];


    modoArea =
        false;


    btnArea.classList.remove(
        "activo"
    );


    btnArea.textContent =
        "📐 Medir área";


    renderer.domElement.style.cursor =
        "default";

}


// ======================================================
// CANCELAR ÁREA
// ======================================================

function cancelarArea() {

    puntosArea =
        [];

    limpiarPuntosTemporales();

    modoArea =
        false;


    btnArea.classList.remove(
        "activo"
    );


    btnArea.textContent =
        "📐 Medir área";

}


// ======================================================
// LIMPIAR PUNTOS TEMPORALES
// ======================================================

function limpiarPuntosTemporales() {

    marcadoresArea.forEach(
        marcador => {

            scene.remove(
                marcador
            );

            marcador.geometry.dispose();

            marcador.material.dispose();

        }
    );


    marcadoresArea =
        [];


    if (lineaTemporal) {

        scene.remove(
            lineaTemporal
        );

        lineaTemporal.geometry.dispose();

        lineaTemporal.material.dispose();

        lineaTemporal =
            null;

    }

}


// ======================================================
// PROYECCIÓN 3D → 2D
//
// Se crea un sistema de coordenadas 2D sobre el plano
// aproximado del polígono.
// ======================================================

function proyectarPoligono2D(
    puntos
) {

    const normal =
        calcularNormalPoligono(
            puntos
        );


    if (
        normal.lengthSq() < 1e-12
    ) {

        return null;

    }


    normal.normalize();


    /*
     * Elegimos un vector de referencia que no sea
     * prácticamente paralelo a la normal.
     */

    let referencia;


    if (
        Math.abs(normal.x) <
        0.9
    ) {

        referencia =
            new THREE.Vector3(
                1,
                0,
                0
            );

    } else {

        referencia =
            new THREE.Vector3(
                0,
                1,
                0
            );

    }


    const ejeU =
        new THREE.Vector3()
            .crossVectors(
                referencia,
                normal
            )
            .normalize();


    const ejeV =
        new THREE.Vector3()
            .crossVectors(
                normal,
                ejeU
            )
            .normalize();


    const origen =
        puntos[0];


    return puntos.map(
        punto => {

            const vector =
                new THREE.Vector3()
                    .subVectors(
                        punto,
                        origen
                    );


            return {

                x:
                    vector.dot(
                        ejeU
                    ),

                y:
                    vector.dot(
                        ejeV
                    )

            };

        }
    );

}


// ======================================================
// NORMAL DEL POLÍGONO
// ======================================================

function calcularNormalPoligono(
    puntos
) {

    const normal =
        new THREE.Vector3();


    for (
        let i = 0;
        i < puntos.length;
        i++
    ) {

        const actual =
            puntos[i];

        const siguiente =
            puntos[
                (i + 1) %
                puntos.length
            ];


        normal.x +=
            (
                actual.y -
                siguiente.y
            )
            *
            (
                actual.z +
                siguiente.z
            );


        normal.y +=
            (
                actual.z -
                siguiente.z
            )
            *
            (
                actual.x +
                siguiente.x
            );


        normal.z +=
            (
                actual.x -
                siguiente.x
            )
            *
            (
                actual.y +
                siguiente.y
            );

    }


    return normal;

}


// ======================================================
// ÁREA SIGNADA 2D
// ======================================================

function areaSignada2D(
    puntos
) {

    let area =
        0;


    for (
        let i = 0;
        i < puntos.length;
        i++
    ) {

        const a =
            puntos[i];

        const b =
            puntos[
                (i + 1) %
                puntos.length
            ];


        area +=
            a.x * b.y -
            b.x * a.y;

    }


    return area / 2;

}


// ======================================================
// ORIENTACIÓN
// ======================================================

function orientacion2D(
    a,
    b,
    c
) {

    return (

        b.x - a.x
    )
    *
    (
        c.y - a.y
    )
    -
    (
        b.y - a.y
    )
    *
    (
        c.x - a.x
    );

}


// ======================================================
// PUNTO EN TRIÁNGULO
// ======================================================

function puntoDentroTriangulo(

    p,
    a,
    b,
    c

) {

    const o1 =
        orientacion2D(
            a,
            b,
            p
        );

    const o2 =
        orientacion2D(
            b,
            c,
            p
        );

    const o3 =
        orientacion2D(
            c,
            a,
            p
        );


    const positivo =
        o1 > 1e-10 ||
        o2 > 1e-10 ||
        o3 > 1e-10;


    const negativo =
        o1 < -1e-10 ||
        o2 < -1e-10 ||
        o3 < -1e-10;


    return !(
        positivo &&
        negativo
    );

}


// ======================================================
// SEGMENTOS SE INTERSECTAN
// ======================================================

function segmentosSeCruzan(

    a,
    b,
    c,
    d

) {

    const o1 =
        orientacion2D(
            a,
            b,
            c
        );

    const o2 =
        orientacion2D(
            a,
            b,
            d
        );

    const o3 =
        orientacion2D(
            c,
            d,
            a
        );

    const o4 =
        orientacion2D(
            c,
            d,
            b
        );


    const eps =
        1e-10;


    function enSegmento(
        p,
        q,
        r
    ) {

        return (

            q.x >=
                Math.min(
                    p.x,
                    r.x
                ) - eps &&

            q.x <=
                Math.max(
                    p.x,
                    r.x
                ) + eps &&

            q.y >=
                Math.min(
                    p.y,
                    r.y
                ) - eps &&

            q.y <=
                Math.max(
                    p.y,
                    r.y
                ) + eps

        );

    }


    if (
        Math.abs(o1) < eps &&
        enSegmento(a, c, b)
    ) {

        return true;

    }


    if (
        Math.abs(o2) < eps &&
        enSegmento(a, d, b)
    ) {

        return true;

    }


    if (
        Math.abs(o3) < eps &&
        enSegmento(c, a, d)
    ) {

        return true;

    }


    if (
        Math.abs(o4) < eps &&
        enSegmento(c, b, d)
    ) {

        return true;

    }


    return (

        (
            o1 > 0 &&
            o2 < 0
        )
        ||
        (
            o1 < 0 &&
            o2 > 0
        )

    )
    &&
    (

        (
            o3 > 0 &&
            o4 < 0
        )
        ||
        (
            o3 < 0 &&
            o4 > 0
        )

    );

}


// ======================================================
// DETECTAR POLÍGONO AUTOINTERSECTADO
// ======================================================

function poligonoSeCruza(
    puntos
) {

    const puntos2D =
        proyectarPoligono2D(
            puntos
        );


    if (!puntos2D) {

        return true;

    }


    const n =
        puntos2D.length;


    for (
        let i = 0;
        i < n;
        i++
    ) {

        const a =
            puntos2D[i];

        const b =
            puntos2D[
                (i + 1) % n
            ];


        for (
            let j = i + 1;
            j < n;
            j++
        ) {

            /*
             * Segmentos consecutivos comparten
             * un punto y no deben contarse.
             */

            if (
                j === i ||
                j === (i + 1) % n ||
                i === (j + 1) % n
            ) {

                continue;

            }


            const c =
                puntos2D[j];

            const d =
                puntos2D[
                    (j + 1) % n
                ];


            if (
                segmentosSeCruzan(
                    a,
                    b,
                    c,
                    d
                )
            ) {

                return true;

            }

        }

    }


    return false;

}


// ======================================================
// TRIANGULACIÓN EAR CLIPPING
//
// IMPORTANTE:
// Los índices se mantienen en el mismo orden de
// los puntos originales.
// ======================================================

function triangularPoligono(
    puntos
) {

    const puntos2D =
        proyectarPoligono2D(
            puntos
        );


    if (!puntos2D) {

        return null;

    }


    const n =
        puntos.length;


    if (n < 3) {

        return null;

    }


    let indices =
        [];


    for (
        let i = 0;
        i < n;
        i++
    ) {

        indices.push(
            i
        );

    }


    const area =
        areaSignada2D(
            puntos2D
        );


    if (
        Math.abs(area) <
        1e-10
    ) {

        return null;

    }


    const orientacion =
        area > 0
            ? 1
            : -1;


    const triangulos =
        [];


    let intentos =
        0;


    const maxIntentos =
        n * n;


    while (
        indices.length > 3 &&
        intentos < maxIntentos
    ) {

        let orejaEncontrada =
            false;


        for (
            let i = 0;
            i < indices.length;
            i++
        ) {

            const indiceAnterior =
                indices[
                    (
                        i -
                        1 +
                        indices.length
                    )
                    %
                    indices.length
                ];


            const indiceActual =
                indices[i];


            const indiceSiguiente =
                indices[
                    (
                        i + 1
                    )
                    %
                    indices.length
                ];


            const a =
                puntos2D[
                    indiceAnterior
                ];

            const b =
                puntos2D[
                    indiceActual
                ];

            const c =
                puntos2D[
                    indiceSiguiente
                ];


            const cross =
                orientacion2D(
                    a,
                    b,
                    c
                );


            /*
             * El vértice debe ser convexo.
             */

            if (
                cross * orientacion
                <= 1e-10
            ) {

                continue;

            }


            /*
             * Comprobamos que la diagonal
             * anterior-siguiente no cruce
             * otro lado del polígono.
             */

            if (
                diagonalCruzaPoligono(

                    indiceAnterior,

                    indiceSiguiente,

                    indices,

                    puntos2D

                )
            ) {

                continue;

            }


            /*
             * Comprobamos que ningún otro
             * vértice esté dentro de la oreja.
             */

            let contienePunto =
                false;


            for (
                let j = 0;
                j < indices.length;
                j++
            ) {

                const indicePrueba =
                    indices[j];


                if (
                    indicePrueba ===
                        indiceAnterior
                    ||
                    indicePrueba ===
                        indiceActual
                    ||
                    indicePrueba ===
                        indiceSiguiente
                ) {

                    continue;

                }


                if (
                    puntoDentroTriangulo(

                        puntos2D[
                            indicePrueba
                        ],

                        a,
                        b,
                        c

                    )
                ) {

                    contienePunto =
                        true;

                    break;

                }

            }


            if (
                contienePunto
            ) {

                continue;

            }


            /*
             * Encontramos una oreja.
             */

            triangulos.push([

                indiceAnterior,

                indiceActual,

                indiceSiguiente

            ]);


            indices.splice(
                i,
                1
            );


            orejaEncontrada =
                true;


            break;

        }


        if (!orejaEncontrada) {

            intentos++;

        } else {

            intentos = 0;

        }


        if (
            intentos >
            indices.length * 2
        ) {

            return null;

        }

    }


    if (
        indices.length === 3
    ) {

        triangulos.push([

            indices[0],

            indices[1],

            indices[2]

        ]);

    }


    return triangulos;

}


// ======================================================
// COMPROBAR DIAGONAL
// ======================================================

function diagonalCruzaPoligono(

    indiceA,
    indiceB,
    indices,
    puntos2D

) {

    const a =
        puntos2D[
            indiceA
        ];

    const b =
        puntos2D[
            indiceB
        ];


    for (
        let i = 0;
        i < indices.length;
        i++
    ) {

        const cIndex =
            indices[i];

        const dIndex =
            indices[
                (i + 1) %
                indices.length
            ];


        /*
         * Ignorar lados que parten desde
         * los extremos de la diagonal.
         */

        if (
            cIndex === indiceA ||
            cIndex === indiceB ||
            dIndex === indiceA ||
            dIndex === indiceB
        ) {

            continue;

        }


        const c =
            puntos2D[
                cIndex
            ];

        const d =
            puntos2D[
                dIndex
            ];


        if (
            segmentosSeCruzan(
                a,
                b,
                c,
                d
            )
        ) {

            return true;

        }

    }


    return false;

}


// ======================================================
// CREAR SUPERFICIE DEL ÁREA
// ======================================================

function crearSuperficieArea(

    puntos,

    triangulos

) {

    const posiciones =
        [];


    puntos.forEach(
        punto => {

            posiciones.push(

                punto.x,

                punto.y,

                punto.z

            );

        }
    );


    const geometria =
        new THREE.BufferGeometry();


    geometria.setAttribute(

        "position",

        new THREE.Float32BufferAttribute(

            posiciones,

            3

        )

    );


    const indices =
        [];


    triangulos.forEach(
        triangulo => {

            indices.push(

                triangulo[0],

                triangulo[1],

                triangulo[2]

            );

        }
    );


    geometria.setIndex(
        indices
    );


    geometria.computeVertexNormals();


    const material =
        new THREE.MeshBasicMaterial({

            color:
                0x00ff00,

            transparent:
                true,

            opacity:
                0.20,

            side:
                THREE.DoubleSide,

            depthWrite:
                false

        });


    return new THREE.Mesh(

        geometria,

        material

    );

}


// ======================================================
// ÁREA DE TRIÁNGULOS
//
// Esta es ahora la misma triangulación utilizada
// visualmente para crear la superficie.
// ======================================================

function calcularAreaTriangulada(

    puntos,

    triangulos

) {

    let area =
        0;


    triangulos.forEach(
        triangulo => {

            const A =
                puntos[
                    triangulo[0]
                ];

            const B =
                puntos[
                    triangulo[1]
                ];

            const C =
                puntos[
                    triangulo[2]
                ];


            const AB =
                new THREE.Vector3()
                    .subVectors(
                        B,
                        A
                    );


            const AC =
                new THREE.Vector3()
                    .subVectors(
                        C,
                        A
                    );


            const cruz =
                new THREE.Vector3()
                    .crossVectors(
                        AB,
                        AC
                    );


            area +=
                cruz.length() / 2;

        }
    );


    return area;

}


// ======================================================
// CREAR ITEM LISTA
// ======================================================

function crearItemLista(
    medicion
) {

    sinMediciones.style.display =
        "none";


    const item =
        document.createElement(
            "div"
        );


    item.className =
        "medicionItem";


    const tipo =
        document.createElement(
            "div"
        );


    tipo.className =
        "medicionTipo";


    tipo.textContent =
        medicion.tipo;


    const valor =
        document.createElement(
            "div"
        );


    valor.className =
        "medicionValor";


    valor.textContent =

        medicion.valor.toFixed(2)
        +
        " "
        +
        medicion.unidad;


    item.appendChild(
        tipo
    );


    item.appendChild(
        valor
    );


    listaMediciones.appendChild(
        item
    );


    medicion.lista =
        item;


    item.addEventListener(
        "click",
        () => {

            seleccionarMedicion(
                medicion
            );

        }
    );

}


// ======================================================
// SELECCIONAR MEDICIÓN
// ======================================================

function seleccionarMedicion(
    medicion
) {

    medicionSeleccionada =
        medicion;


    mediciones.forEach(
        m => {

            if (m.lista) {

                m.lista.classList.remove(
                    "seleccionada"
                );

            }

        }
    );


    if (medicion.lista) {

        medicion.lista.classList.add(
            "seleccionada"
        );

    }


    mediciones.forEach(
        m => {

            cambiarColorMedicion(

                m,

                m === medicion

            );

        }
    );

}


// ======================================================
// CAMBIAR COLOR
// ======================================================

function cambiarColorMedicion(

    medicion,

    seleccionada

) {

    const color =
        seleccionada

            ? 0xffff00

            : (
                medicion.tipo === "Área"
                    ? 0x00ff00
                    : 0xff0000
            );


    medicion.grupo.traverse(
        objeto => {

            if (
                objeto.material &&
                objeto.material.color
            ) {

                objeto.material.color.set(
                    color
                );

            }

        }
    );

}


// ======================================================
// EDICIÓN DE PUNTOS
// ======================================================

renderer.domElement.addEventListener(
    "pointerdown",
    iniciarArrastre
);


renderer.domElement.addEventListener(
    "pointermove",
    moverPunto
);


renderer.domElement.addEventListener(
    "pointerup",
    terminarArrastre
);


function iniciarArrastre(
    event
) {

    if (
        !modoEdicion ||
        !medicionSeleccionada
    ) {

        return;

    }


    const rect =
        renderer.domElement
            .getBoundingClientRect();


    mouse.x =
        (
            (
                event.clientX -
                rect.left
            )
            /
            rect.width
        )
        *
        2
        -
        1;


    mouse.y =
        -(
            (
                event.clientY -
                rect.top
            )
            /
            rect.height
        )
        *
        2
        +
        1;


    raycaster.setFromCamera(
        mouse,
        camera
    );


    const intersecciones =
        raycaster.intersectObjects(

            medicionSeleccionada.marcadores,

            false

        );


    if (
        intersecciones.length === 0
    ) {

        return;

    }


    puntoArrastrando =
        intersecciones[0]
            .object;


    indicePuntoArrastrando =
        medicionSeleccionada.marcadores
            .indexOf(
                puntoArrastrando
            );


    medicionArrastrando =
        medicionSeleccionada;


    arrastrando =
        true;


    controls.enabled =
        false;


    renderer.domElement.style.cursor =
        "grabbing";

}


// ======================================================
// MOVER PUNTO
// ======================================================

function moverPunto(
    event
) {

    if (
        !arrastrando ||
        !medicionArrastrando
    ) {

        return;

    }


    const punto =
        obtenerPuntoModelo(
            event
        );


    if (!punto) {

        return;

    }


    const medicion =
        medicionArrastrando;


    medicion.puntos[
        indicePuntoArrastrando
    ].copy(
        punto
    );


    puntoArrastrando.position.copy(
        punto
    );


    actualizarMedicion(
        medicion
    );

}


// ======================================================
// TERMINAR ARRASTRE
// ======================================================

function terminarArrastre() {

    if (!arrastrando) {

        return;

    }


    arrastrando =
        false;


    puntoArrastrando =
        null;


    indicePuntoArrastrando =
        -1;


    medicionArrastrando =
        null;


    controls.enabled =
        true;


    renderer.domElement.style.cursor =
        "grab";

}


// ======================================================
// ACTUALIZAR MEDICIÓN
// ======================================================

function actualizarMedicion(
    medicion
) {

    // --------------------------------------------------
    // DISTANCIA
    // --------------------------------------------------

    if (
        medicion.tipo ===
        "Distancia"
    ) {

        const A =
            medicion.puntos[0];

        const B =
            medicion.puntos[1];


        const distancia =
            A.distanceTo(
                B
            );


        medicion.valor =
            distancia;


        medicion.linea.geometry.dispose();


        medicion.linea.geometry =
            new THREE.BufferGeometry()
                .setFromPoints([

                    A,
                    B

                ]);


        medicion.etiqueta.textContent =
            distancia.toFixed(2)
            +
            " m";


        actualizarItemLista(
            medicion
        );

    }


    // --------------------------------------------------
    // ÁREA
    // --------------------------------------------------

    if (
        medicion.tipo ===
        "Área"
    ) {

        const puntos =
            medicion.puntos;


        /*
         * Si durante la edición se genera
         * un polígono autointersectado,
         * no se intenta calcular una superficie
         * incorrecta.
         */

        if (
            poligonoSeCruza(
                puntos
            )
        ) {

            medicion.etiqueta.textContent =
                "Polígono inválido";

            return;

        }


        const triangulos =
            triangularPoligono(
                puntos
            );


        if (
            !triangulos
        ) {

            return;

        }


        const area =
            calcularAreaTriangulada(

                puntos,

                triangulos

            );


        medicion.valor =
            area;


        medicion.triangulos =
            triangulos;


        medicion.etiqueta.textContent =
            area.toFixed(2)
            +
            " m²";


        actualizarSuperficie(
            medicion
        );


        actualizarItemLista(
            medicion
        );

    }

}


// ======================================================
// ACTUALIZAR SUPERFICIE
// ======================================================

function actualizarSuperficie(
    medicion
) {

    const nuevaSuperficie =
        crearSuperficieArea(

            medicion.puntos,

            medicion.triangulos

        );


    const superficieAnterior =
        medicion.superficie;


    medicion.grupo.remove(
        superficieAnterior
    );


    superficieAnterior.geometry.dispose();

    superficieAnterior.material.dispose();


    medicion.superficie =
        nuevaSuperficie;


    medicion.grupo.add(
        nuevaSuperficie
    );


    /*
     * La línea siempre conserva el orden
     * original de los puntos.
     */

    medicion.linea.geometry.dispose();


    medicion.linea.geometry =
        new THREE.BufferGeometry()
            .setFromPoints(
                medicion.puntos
            );


    medicion.marcadores.forEach(

        (marcador, index) => {

            marcador.position.copy(
                medicion.puntos[index]
            );

        }

    );

}


// ======================================================
// ACTUALIZAR ITEM LISTA
// ======================================================

function actualizarItemLista(
    medicion
) {

    if (!medicion.lista) {

        return;

    }


    const valor =
        medicion.lista
            .querySelector(
                ".medicionValor"
            );


    if (valor) {

        valor.textContent =
            medicion.valor.toFixed(2)
            +
            " "
            +
            medicion.unidad;

    }

}


// ======================================================
// ELIMINAR SELECCIONADA
// ======================================================

btnEliminar.addEventListener(
    "click",
    () => {

        if (!medicionSeleccionada) {

            alert(
                "Selecciona primero una medición."
            );

            return;

        }


        eliminarMedicion(

            medicionSeleccionada,

            true

        );

    }
);


// ======================================================
// ELIMINAR MEDICIÓN
// ======================================================

function eliminarMedicion(

    medicion,

    guardarHistorial = true

) {

    if (
        guardarHistorial
    ) {

        historialEliminaciones.push(
            medicion
        );

    }


    scene.remove(
        medicion.grupo
    );


    if (
        medicion.etiqueta
    ) {

        medicion.etiqueta.style.display =
            "none";

    }


    if (
        medicion.lista
    ) {

        medicion.lista.remove();

        medicion.lista =
            null;

    }


    mediciones =
        mediciones.filter(
            m =>
                m !== medicion
        );


    if (
        medicionSeleccionada ===
        medicion
    ) {

        medicionSeleccionada =
            null;

    }


    if (
        mediciones.length === 0
    ) {

        sinMediciones.style.display =
            "block";

    }


    actualizarBotonDeshacer();

}


// ======================================================
// DESHACER ELIMINACIÓN
// ======================================================

btnDeshacer.addEventListener(
    "click",
    () => {

        deshacerEliminacion();

    }
);


function deshacerEliminacion() {

    if (
        historialEliminaciones.length === 0
    ) {

        return;

    }


    const medicion =
        historialEliminaciones.pop();


    scene.add(
        medicion.grupo
    );


    if (
        medicion.etiqueta
    ) {

        medicion.etiqueta.style.display =
            "block";

    }


    mediciones.push(
        medicion
    );


    crearItemLista(
        medicion
    );


    seleccionarMedicion(
        medicion
    );


    actualizarBotonDeshacer();

}


// ======================================================
// BOTÓN DESHACER
// ======================================================

function actualizarBotonDeshacer() {

    btnDeshacer.disabled =
        historialEliminaciones.length === 0;

}


// ======================================================
// LIMPIAR TODO
// ======================================================

btnLimpiar.addEventListener(
    "click",
    () => {

        if (
            mediciones.length === 0 &&
            !modoArea &&
            !primerPunto
        ) {

            return;

        }


        mediciones.forEach(
            medicion => {

                scene.remove(
                    medicion.grupo
                );


                medicion.grupo.traverse(
                    objeto => {

                        if (
                            objeto.geometry
                        ) {

                            objeto.geometry.dispose();

                        }


                        if (
                            objeto.material
                        ) {

                            objeto.material.dispose();

                        }

                    }
                );


                if (
                    medicion.etiqueta
                ) {

                    medicion.etiqueta.remove();

                }


                if (
                    medicion.lista
                ) {

                    medicion.lista.remove();

                }

            }
        );


        mediciones =
            [];


        historialEliminaciones.length =
            0;


        medicionSeleccionada =
            null;


        sinMediciones.style.display =
            "block";


        primerPunto =
            null;


        eliminarMarcadorPrimerPunto();


        puntosArea =
            [];


        limpiarPuntosTemporales();


        modoMedicion =
            false;


        modoArea =
            false;


        btnMedir.classList.remove(
            "activo"
        );


        btnArea.classList.remove(
            "activo"
        );


        btnMedir.textContent =
            "📏 Medir distancia";


        btnArea.textContent =
            "📐 Medir área";


        renderer.domElement.style.cursor =
            "default";


        actualizarBotonDeshacer();

    }
);


// ======================================================
// CENTRAR MODELO
// ======================================================

btnCentrar.addEventListener(
    "click",
    () => {

        if (!modelo) {

            return;

        }


        controls.target.set(
            0,
            0,
            0
        );


        controls.update();

    }
);


// ======================================================
// VISTA INICIAL
// ======================================================

btnVista.addEventListener(
    "click",
    () => {

        if (!modelo) {

            return;

        }


        camera.position.set(

            distanciaInicial,

            distanciaInicial * 0.8,

            distanciaInicial

        );


        controls.target.set(
            0,
            0,
            0
        );


        controls.update();

    }
);


// ======================================================
// PANTALLA COMPLETA
// ======================================================

btnFullscreen.addEventListener(
    "click",
    () => {

        if (
            !document.fullscreenElement
        ) {

            document.documentElement
                .requestFullscreen();

        } else {

            document.exitFullscreen();

        }

    }
);


// ======================================================
// ESC + CTRL Z
// ======================================================

window.addEventListener(
    "keydown",
    event => {

        // ------------------------------------------------
        // CTRL + Z
        // ------------------------------------------------

        if (

            (
                event.ctrlKey ||
                event.metaKey
            )
            &&
            event.key.toLowerCase() ===
                "z"

        ) {

            event.preventDefault();

            event.stopPropagation();

            manejarDeshacer();

            return;

        }


        // ------------------------------------------------
        // ESC
        // ------------------------------------------------

        if (
            event.key ===
            "Escape"
        ) {

            event.preventDefault();

            manejarEscape();

            return;

        }

    },
    true
);


// ======================================================
// MANEJAR ESC
// ======================================================

function manejarEscape() {

    // --------------------------------------------------
    // EDITANDO
    // --------------------------------------------------

    if (modoEdicion) {

        salirModoEdicion();

        return;

    }


    // --------------------------------------------------
    // DISTANCIA
    // --------------------------------------------------

    if (
        modoMedicion &&
        primerPunto
    ) {

        primerPunto =
            null;

        eliminarMarcadorPrimerPunto();

        renderer.domElement.style.cursor =
            "crosshair";

        return;

    }


    // --------------------------------------------------
    // ÁREA
    // --------------------------------------------------

    if (
        modoArea &&
        puntosArea.length > 0
    ) {

        eliminarUltimoPuntoArea();

        return;

    }


    // --------------------------------------------------
    // CANCELAR TODO
    // --------------------------------------------------

    modoMedicion =
        false;

    modoArea =
        false;

    primerPunto =
        null;


    eliminarMarcadorPrimerPunto();


    puntosArea =
        [];


    limpiarPuntosTemporales();


    btnMedir.classList.remove(
        "activo"
    );


    btnArea.classList.remove(
        "activo"
    );


    btnMedir.textContent =
        "📏 Medir distancia";


    btnArea.textContent =
        "📐 Medir área";


    renderer.domElement.style.cursor =
        "default";

}


// ======================================================
// ELIMINAR ÚLTIMO PUNTO DEL ÁREA
// ======================================================

function eliminarUltimoPuntoArea() {

    if (
        puntosArea.length === 0
    ) {

        return;

    }


    puntosArea.pop();


    if (
        marcadoresArea.length > 0
    ) {

        const marcador =
            marcadoresArea.pop();


        scene.remove(
            marcador
        );


        marcador.geometry.dispose();

        marcador.material.dispose();

    }


    actualizarPoligonoTemporal();

}


// ======================================================
// DESHACER
// ======================================================

function manejarDeshacer() {

    // --------------------------------------------------
    // ÁREA EN PROCESO
    // --------------------------------------------------

    if (
        modoArea &&
        puntosArea.length > 0
    ) {

        eliminarUltimoPuntoArea();

        return;

    }


    // --------------------------------------------------
    // DISTANCIA EN PROCESO
    // --------------------------------------------------

    if (
        modoMedicion &&
        primerPunto
    ) {

        primerPunto =
            null;

        eliminarMarcadorPrimerPunto();

        return;

    }


    // --------------------------------------------------
    // RECUPERAR MEDICIÓN
    // --------------------------------------------------

    deshacerEliminacion();

}


// ======================================================
// ETIQUETAS
// ======================================================

function actualizarEtiquetas() {

    mediciones.forEach(
        medicion => {

            if (
                !medicion.etiqueta
            ) {

                return;

            }


            if (
                !medicion.puntos ||
                medicion.puntos.length === 0
            ) {

                return;

            }


            const centro =
                calcularCentro(
                    medicion.puntos
                );


            const punto =
                centro.clone();


            punto.project(
                camera
            );


            const x =
                (
                    punto.x *
                    0.5 +
                    0.5
                )
                *
                window.innerWidth;


            const y =
                (
                    -punto.y *
                    0.5 +
                    0.5
                )
                *
                window.innerHeight;


            medicion.etiqueta.style.left =
                x + "px";


            medicion.etiqueta.style.top =
                y + "px";

        }
    );

}


// ======================================================
// CENTRO
// ======================================================

function calcularCentro(
    puntos
) {

    const centro =
        new THREE.Vector3();


    puntos.forEach(
        punto => {

            centro.add(
                punto
            );

        }
    );


    centro.divideScalar(
        puntos.length
    );


    return centro;

}


// ======================================================
// RESIZE
// ======================================================

window.addEventListener(
    "resize",
    () => {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;


        camera.updateProjectionMatrix();


        renderer.setSize(

            window.innerWidth,

            window.innerHeight

        );

    }
);


// ======================================================
// ANIMACIÓN
// ======================================================

function animate() {

    requestAnimationFrame(
        animate
    );


    controls.update();


    actualizarEtiquetas();


    renderer.render(
        scene,
        camera
    );

}


animate();


// ======================================================
// ESTADO INICIAL
// ======================================================

actualizarBotonDeshacer();
