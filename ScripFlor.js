const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl");

// ==========================
// VERTEX SHADER
// ==========================

const vertexShaderSource = `
    attribute vec2 position;

    void main() {
        gl_Position = vec4(position, 0.0, 1.0);
    }
`;


// ==========================
// FRAGMENT SHADER
// ==========================

const fragmentShaderSource = `
    precision mediump float;

    uniform vec3 cor;

    void main() {
        gl_FragColor = vec4(cor, 1.0);
    }
`;


// ==========================
// CRIAR OS SHADERS
// ==========================

function criarShader(tipo, fonte) {

    const shader = gl.createShader(tipo);

    gl.shaderSource(shader, fonte);

    gl.compileShader(shader);

    return shader;
}

const vertexShader =
    criarShader(gl.VERTEX_SHADER, vertexShaderSource);

const fragmentShader =
    criarShader(gl.FRAGMENT_SHADER, fragmentShaderSource);


// ==========================
// CRIAR O PROGRAMA
// ==========================

const programa = gl.createProgram();
gl.attachShader(programa, vertexShader);
gl.attachShader(programa, fragmentShader);
gl.linkProgram(programa);
gl.useProgram(programa);

// ==========================
// FUNÇÃO PARA DESENHAR CÍRCULO
// ==========================

function desenharCirculo(centroX, centroY, raio, cor) {

    const vertices = [];

    // Adiciona o centro do círculo
    vertices.push(centroX, centroY);

    // Quantidade de pontos da circunferência
    const quantidadePontos = 100;

    // Cria os pontos ao redor do círculo
    for (let i = 0; i <= quantidadePontos; i++) {

        const angulo =
            (i / quantidadePontos) * Math.PI * 2;

        const x =
            centroX + Math.cos(angulo) * raio;

        const y =
            centroY + Math.sin(angulo) * raio;

        vertices.push(x, y);
    }

    // ==========================
    // CRIAR O BUFFER
    // ==========================

    const buffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(vertices),
        gl.STATIC_DRAW
    );

    // ==========================
    // LIGAR OS VÉRTICES
    // ==========================

    const position =
        gl.getAttribLocation(programa, "position");

    gl.enableVertexAttribArray(position);

    gl.vertexAttribPointer(
        position,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );

    // ==========================
    // DESENHAR O CÍRCULO
    // ==========================

    const localCor = gl.getUniformLocation(programa, "cor");
    gl.uniform3fv(localCor, cor);

    gl.drawArrays(
        gl.TRIANGLE_FAN,
        0,
        vertices.length / 2
    );
}

// ==========================
// FUNÇÃO PARA DESENHAR RETÂNGULO
// ==========================

function desenharParalelepipedo(centroX, centroY, A, B, cor) {

    // Calcula os limites do retângulo
    const esquerda = centroX - A / 2;
    const direita  = centroX + A / 2;

    const baixo = centroY - B / 2;
    const cima  = centroY + B / 2;

    // Os 4 vértices do retângulo
    const vertices = [
        esquerda, baixo,
        direita,  baixo,
        esquerda, cima,
        direita,  cima
    ];

    // Criar buffer
    const buffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(vertices),
        gl.STATIC_DRAW
    );

    // Localização da posição
    const position =
        gl.getAttribLocation(programa, "position");

    gl.enableVertexAttribArray(position);

    gl.vertexAttribPointer(
        position,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );

    // Definir a cor
    const localCor =
        gl.getUniformLocation(programa, "cor");

    gl.uniform3fv(localCor, cor);

    // Desenhar o retângulo
    gl.drawArrays(
        gl.TRIANGLE_STRIP,
        0,
        4
    );
}

// ==========================
// LIMPAR A TELA
// ==========================

// Fundo preto
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

desenharCirculo(0.0, 0.0, 0.35, [1.0, 1.0, 0.0]);

desenharCirculo(0.0, 0.0, 0.18, [0.6, 0.3, 0.1]);

desenharCirculo(0.0, 0.4, 0.2, [1.0, 1.0, 0.0]);

desenharCirculo(0.34, -0.2, 0.2, [1.0, 1.0, 0.0]);

desenharCirculo(0.34, 0.2, 0.2, [1.0, 1.0, 0.0]);

desenharCirculo(-0.34, 0.2, 0.2, [1.0, 1.0, 0.0]);

desenharCirculo(-0.34, -0.2, 0.2, [1.0, 1.0, 0.0]);

desenharParalelepipedo(
    0.0,
    -0.8,
    0.08,
    0.7,
    [0.0, 0.6, 0.0]
);

desenharCirculo(0.0, -0.4, 0.2, [1.0, 1.0, 0.0]);
