const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl2");

if (!gl) {
    throw new Error("WebGL 2 não é suportado.");
}

const vertexShaderSource = `#version 300 es

in vec2 aPosition;

uniform mat3 u_viewTransform;
uniform mat3 u_modelTransform;

void main() {

    vec3 position =
        u_viewTransform *
        u_modelTransform *
        vec3(aPosition, 1.0);

    gl_Position =
        vec4(position.xy, 0.0, 1.0);
}
`;

const fragmentShaderSource = `#version 300 es

precision mediump float;

uniform vec3 uColor;

out vec4 outColor;

void main() {

    outColor =
        vec4(uColor, 1.0);
}
`;

function createShader(gl, type, source) {

    const shader =
        gl.createShader(type);

    gl.shaderSource(
        shader,
        source
    );

    gl.compileShader(shader);

    if (
        !gl.getShaderParameter(
            shader,
            gl.COMPILE_STATUS
        )
    ) {

        const error =
            gl.getShaderInfoLog(shader);

        gl.deleteShader(shader);

        throw new Error(error);
    }

    return shader;
}

function createProgram(
    gl,
    vertexShaderSource,
    fragmentShaderSource
) {

    const vertexShader =
        createShader(
            gl,
            gl.VERTEX_SHADER,
            vertexShaderSource
        );

    const fragmentShader =
        createShader(
            gl,
            gl.FRAGMENT_SHADER,
            fragmentShaderSource
        );

    const program =
        gl.createProgram();

    gl.attachShader(
        program,
        vertexShader
    );

    gl.attachShader(
        program,
        fragmentShader
    );

    gl.linkProgram(program);

    if (
        !gl.getProgramParameter(
            program,
            gl.LINK_STATUS
        )
    ) {

        throw new Error(
            gl.getProgramInfoLog(program)
        );
    }

    return program;
}


const program =
    createProgram(
        gl,
        vertexShaderSource,
        fragmentShaderSource
    );


// ==================================================
// CLASSE RENDERER
// ==================================================

class Renderer {

    constructor(gl, program) {
        this.gl = gl;
        this.program = program;

        this.positionLocation =
            gl.getAttribLocation(
                program,
                "aPosition"
            );

        this.colorLocation =
            gl.getUniformLocation(
                program,
                "uColor"
            );

        this.viewTransformLocation =
            gl.getUniformLocation(
                program,
                "u_viewTransform"
            );

        this.modelTransformLocation =
            gl.getUniformLocation(
                program,
                "u_modelTransform"
            );

        this.viewTransform =
            m3.identity();

        this.verticesBuffer =
            gl.createBuffer();
    }

    defineViewTransform(viewTransform) {
        this.viewTransform =
            viewTransform;
    }

    draw(object) {
        const gl = this.gl;

        gl.bindBuffer(
            gl.ARRAY_BUFFER,
            this.verticesBuffer
        );

        gl.bufferData(
            gl.ARRAY_BUFFER,
            object.vertices,
            gl.STATIC_DRAW
        );

        gl.enableVertexAttribArray(
            this.positionLocation
        );

        gl.vertexAttribPointer(
            this.positionLocation,
            2,
            gl.FLOAT,
            false,
            0,
            0
        );

        gl.uniform3fv(
            this.colorLocation,
            object.color
        );

        gl.uniformMatrix3fv(
            this.modelTransformLocation,
            false,
            object.modelTransform
        );

        gl.uniformMatrix3fv(
            this.viewTransformLocation,
            false,
            this.viewTransform
        );

        gl.drawArrays(
            gl.TRIANGLES,
            0,
            object.vertices.length / 2
        );
    }
}

// ==================================================
// FUNÇÕES DE GEOMETRIA
// (baseadas nas funções de desenho do ScriptRobo.js,
// mas retornando listas de vértices em vez de desenhar
// direto na tela — cada objeto agora é posicionado por
// uma matriz de transformação, não por coordenadas fixas)
// ==================================================

function retanguloVertices(centroX, centroY, largura, altura) {

    const esquerda = centroX - largura / 2;
    const direita  = centroX + largura / 2;
    const baixo    = centroY - altura / 2;
    const cima     = centroY + altura / 2;

    return [
        esquerda, baixo,
        direita,  baixo,
        esquerda, cima,

        direita,  baixo,
        direita,  cima,
        esquerda, cima
    ];
}

function circuloVertices(centroX, centroY, raio, segmentos = 60) {

    const vertices = [];

    for (let i = 0; i < segmentos; i++) {

        const theta1 = (i / segmentos) * 2 * Math.PI;
        const theta2 = ((i + 1) / segmentos) * 2 * Math.PI;

        vertices.push(centroX, centroY);

        vertices.push(
            centroX + raio * Math.cos(theta1),
            centroY + raio * Math.sin(theta1)
        );

        vertices.push(
            centroX + raio * Math.cos(theta2),
            centroY + raio * Math.sin(theta2)
        );
    }

    return vertices;
}

// (x, y) é o vértice do ângulo reto; "orientacao" diz para
// qual lado os catetos se estendem (mesma ideia do ScriptRobo.js)
function trianguloRetanguloVertices(x, y, base, altura, orientacao) {

    let x2, y2, x3, y3;

    switch (orientacao) {

        case "superior-direito":
            x2 = x + base; y2 = y;
            x3 = x;        y3 = y + altura;
            break;

        case "superior-esquerdo":
            x2 = x - base; y2 = y;
            x3 = x;        y3 = y + altura;
            break;

        case "inferior-direito":
            x2 = x + base; y2 = y;
            x3 = x;        y3 = y - altura;
            break;

        case "inferior-esquerdo":
        default:
            x2 = x - base; y2 = y;
            x3 = x;        y3 = y - altura;
            break;
    }

    return [x, y, x2, y2, x3, y3];
}

// (x, y) é o ponto médio da base; "direcao" diz para onde
// aponta o ápice ("cima" ou "baixo"); "altura" é opcional
function trianguloEquilateroVertices(x, y, lado, direcao, altura) {

    const alturaFinal =
        altura !== undefined ? altura : (lado * Math.sqrt(3)) / 2;

    const apiceY =
        direcao === "cima" ? y + alturaFinal : y - alturaFinal;

    return [
        x - lado / 2, y,
        x + lado / 2, y,
        x,            apiceY
    ];
}

// ==================================================
// CORES DO ROBÔ
// ==================================================

const CINZA_CLARO  = new Float32Array([0.85, 0.85, 0.85]);
const CINZA_ANTENA = new Float32Array([0.75, 0.75, 0.75]);
const AZUL_MARINHO = new Float32Array([0.14, 0.12, 0.55]);
const VERDE        = new Float32Array([0.00, 0.78, 0.45]);
const PRETO        = new Float32Array([0.00, 0.00, 0.00]);
const BRANCO       = new Float32Array([0.92, 0.92, 0.92]);

// ==================================================
// GEOMETRIA DO ROBÔ (vértices locais, robô "parado" na origem)
// ==================================================

function rodasPretasVertices() {
    return new Float32Array([
        ...circuloVertices(-0.12, -0.68, 0.10),
        ...circuloVertices(0.12, -0.68, 0.10)
    ]);
}

function rodasBrancasVertices() {
    return new Float32Array([
        ...circuloVertices(-0.12, -0.68, 0.05),
        ...circuloVertices(0.12, -0.68, 0.05)
    ]);
}

function corpoCinzaBaixoVertices() {
    return new Float32Array([
        ...retanguloVertices(0.0, -0.57, 0.45, 0.2),
        ...trianguloEquilateroVertices(0.0, 0.0, 0.55, "baixo", 0.67)
    ]);
}

function bateriaBordaVertices() {
    return new Float32Array(
        retanguloVertices(0.0, -0.12, 0.24, 0.15)
    );
}

function bateriaVerdeVertices() {
    return new Float32Array(
        retanguloVertices(-0.01, -0.12, 0.18, 0.10)
    );
}

function bateriaNubVertices() {
    return new Float32Array(
        retanguloVertices(0.135, -0.12, 0.03, 0.05)
    );
}

function pescocoVertices() {
    return new Float32Array(
        retanguloVertices(0.0, 0.1, 0.2, 0.2)
    );
}

function cabecaVertices() {
    return new Float32Array(
        circuloVertices(0.0, 0.4, 0.35)
    );
}

function olhosVertices() {
    return new Float32Array([
        ...trianguloRetanguloVertices(0.29, 0.32, 0.24, 0.22, "superior-esquerdo"),
        ...trianguloRetanguloVertices(-0.29, 0.32, 0.24, 0.22, "superior-direito")
    ]);
}

function antenasHastesVertices() {
    return new Float32Array([
        ...retanguloVertices(-0.465, 0.4, 0.23, 0.015),
        ...retanguloVertices(0.465, 0.4, 0.23, 0.015)
    ]);
}

function antenasBolinhasVertices() {
    return new Float32Array([
        ...circuloVertices(-0.60, 0.4, 0.055),
        ...circuloVertices(0.60, 0.4, 0.055)
    ]);
}

// Braço: geometria local relativa ao OMBRO (o pivô fica em (0,0),
// que corresponde ao ponto onde o braço encosta no torso)
function bracoHasteVertices() {
    return new Float32Array(
        retanguloVertices(0.0, -0.16, 0.08, 0.32)
    );
}

function maoVertices() {
    return new Float32Array(
        circuloVertices(0.0, -0.33, 0.05)
    );
}

// ==================================================
// CLASSE SCENE OBJECT
// ==================================================

class SceneObject {

    constructor(vertices, color) {

        this.vertices = vertices;

        this.color = color;

        this.modelTransform = m3.identity();
    }

    updateModelTransform(modelTransform) {

        this.modelTransform = modelTransform;
    }
}

// ==================================================
// CLASSE ARM (haste + mão, balançando em torno do ombro)
// ==================================================

class Arm {

    constructor(shoulderX, shoulderY, phase) {

        this.shoulderX = shoulderX;
        this.shoulderY = shoulderY;
        this.phase = phase;

        this.haste = new SceneObject(bracoHasteVertices(), AZUL_MARINHO);
        this.mao = new SceneObject(maoVertices(), BRANCO);
    }

    updateModelTransform(bodyTransform, tempo) {

        // Amplitude (em radianos) e velocidade do balanço.
        // Ajuste esses dois valores para um balanço mais
        // largo/estreito ou mais rápido/lento.
        const amplitude = 0.4;
        const velocidade = 0.05;

        const angulo =
            amplitude * Math.sin(tempo * velocidade + this.phase);

        // Gira em torno do ombro (origem local) e depois
        // posiciona o ombro no lugar certo do corpo
        const transformLocal =
            m3.multiply(
                m3.translation(this.shoulderX, this.shoulderY),
                m3.rotation(angulo)
            );

        // Aplica também a translação do corpo (deslize horizontal)
        const modelTransform =
            m3.multiply(bodyTransform, transformLocal);

        this.haste.updateModelTransform(modelTransform);
        this.mao.updateModelTransform(modelTransform);
    }

    draw(renderer) {

        renderer.draw(this.haste);
        renderer.draw(this.mao);
    }
}

// ==================================================
// CLASSE ROBOT
// ==================================================

class Robot {

    constructor(tx, ty, speed) {

        this.tx = tx;
        this.ty = ty;
        this.speed = speed;
        this.tempo = 0;

        // Partes estáticas (cada uma com uma única cor),
        // já na ordem correta de desenho
        this.rodasPretas     = new SceneObject(rodasPretasVertices(), PRETO);
        this.rodasBrancas    = new SceneObject(rodasBrancasVertices(), BRANCO);
        this.corpoCinzaBaixo = new SceneObject(corpoCinzaBaixoVertices(), CINZA_CLARO);
        this.bateriaBorda    = new SceneObject(bateriaBordaVertices(), PRETO);
        this.bateriaVerde    = new SceneObject(bateriaVerdeVertices(), VERDE);
        this.bateriaNub      = new SceneObject(bateriaNubVertices(), PRETO);
        this.pescoco         = new SceneObject(pescocoVertices(), AZUL_MARINHO);
        this.cabeca          = new SceneObject(cabecaVertices(), CINZA_CLARO);
        this.olhos           = new SceneObject(olhosVertices(), VERDE);
        this.antenasHastes   = new SceneObject(antenasHastesVertices(), CINZA_ANTENA);
        this.antenasBolinhas = new SceneObject(antenasBolinhasVertices(), AZUL_MARINHO);

        // Braços, cada um balançando com uma fase diferente
        // (fases opostas: quando um vai para frente, o outro
        // vai para trás, como um balanço de pêndulo)
        this.bracoEsquerdo = new Arm(-0.26, 0.0, 0.0);
        this.bracoDireito  = new Arm(0.26, 0.0, Math.PI);
    }

    move() {

        this.tx += this.speed;

        // Limite de deslocamento horizontal (mundo vai de -2 a 2;
        // deixamos uma margem para o robô não sair do canvas)
        const limite = 1.3;

        if (this.tx > limite || this.tx < -limite) {

            this.speed = -this.speed;
        }

        this.tempo += 1;

        const bodyTransform = m3.translation(this.tx, this.ty);

        // Partes estáticas: só recebem a translação do corpo
        this.rodasPretas.updateModelTransform(bodyTransform);
        this.rodasBrancas.updateModelTransform(bodyTransform);
        this.corpoCinzaBaixo.updateModelTransform(bodyTransform);
        this.bateriaBorda.updateModelTransform(bodyTransform);
        this.bateriaVerde.updateModelTransform(bodyTransform);
        this.bateriaNub.updateModelTransform(bodyTransform);
        this.pescoco.updateModelTransform(bodyTransform);
        this.cabeca.updateModelTransform(bodyTransform);
        this.olhos.updateModelTransform(bodyTransform);
        this.antenasHastes.updateModelTransform(bodyTransform);
        this.antenasBolinhas.updateModelTransform(bodyTransform);

        // Braços: translação do corpo + balanço próprio
        this.bracoEsquerdo.updateModelTransform(bodyTransform, this.tempo);
        this.bracoDireito.updateModelTransform(bodyTransform, this.tempo);
    }

    draw(renderer) {

        renderer.draw(this.rodasPretas);
        renderer.draw(this.rodasBrancas);
        renderer.draw(this.corpoCinzaBaixo);

        this.bracoEsquerdo.draw(renderer);
        this.bracoDireito.draw(renderer);

        renderer.draw(this.bateriaBorda);
        renderer.draw(this.bateriaVerde);
        renderer.draw(this.bateriaNub);
        renderer.draw(this.pescoco);
        renderer.draw(this.cabeca);
        renderer.draw(this.olhos);
        renderer.draw(this.antenasHastes);
        renderer.draw(this.antenasBolinhas);
    }
}

// ==================================================
// CLASSE SCENE
// ==================================================

class Scene {

    constructor(gl, program) {

        this.renderer = new Renderer(gl, program);

        this.viewTransform = m3.setClippingWindow(-2.0, -1.0, 2.0, 1.0);

        this.renderer.defineViewTransform(this.viewTransform);

        this.robot = new Robot(0.0, 0.0, 0.005);
    }

    update() {

        this.robot.move();
    }

    draw() {

        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(program);

        this.robot.draw(this.renderer);
    }

    execute() {

        this.update();

        this.draw();

        requestAnimationFrame(() => this.execute());
    }

    init() {

        requestAnimationFrame(() => this.execute());
    }
}


// ==================================================
// CONFIGURAÇÃO INICIAL DO WEBGL
// ==================================================

gl.clearColor(
    0.35,
    0.35,
    0.35,
    1.0
);

gl.viewport(
    0,
    0,
    canvas.width,
    canvas.height
);


// ==================================================
// CRIAR CENA
// ==================================================

const scene =
    new Scene(gl, program);


// ==================================================
// INICIAR ANIMAÇÃO
// ==================================================

scene.init();
