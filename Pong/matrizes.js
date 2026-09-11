// Objeto que reúne funções para trabalhar com
// matrizes 3x3 usadas em transformações 2D.
var m3 = {

  // ============================================================
  // identity()
  // ============================================================
  // Retorna a matriz identidade 3x3.
  //
  // A matriz identidade é o equivalente ao número 1
  // na multiplicação de números:
  //
  //     M * I = M
  //
  // Ela não altera a posição, escala ou rotação do objeto.
  identity: function(){
    return [
      1, 0, 0,
      0, 1, 0,
      0, 0, 1
    ];
  },


  // ============================================================
  // multiply(a, b)
  // ============================================================
  // Multiplica duas matrizes 3x3:
  //
  //     resultado = a * b
  //
  // As matrizes estão armazenadas em um vetor (array).
  //
  // Exemplo de matriz:
  //
  // | a00  a01  a02 |
  // | a10  a11  a12 |
  // | a20  a21  a22 |
  //
  // Porém, nesse código a matriz está armazenada em
  // uma ordem adequada para trabalhar com WebGL.
  multiply: function(a,b){

    // ----------------------------------------------------------
    // Pega os elementos da matriz A
    // ----------------------------------------------------------

    var a00 = a[0*3+0];
    var a01 = a[1*3+0];
    var a02 = a[2*3+0];

    var a10 = a[0*3+1];
    var a11 = a[1*3+1];
    var a12 = a[2*3+1];

    var a20 = a[0*3+2];
    var a21 = a[1*3+2];
    var a22 = a[2*3+2];


    // ----------------------------------------------------------
    // Pega os elementos da matriz B
    // ----------------------------------------------------------

    var b00 = b[0*3+0];
    var b01 = b[1*3+0];
    var b02 = b[2*3+0];

    var b10 = b[0*3+1];
    var b11 = b[1*3+1];
    var b12 = b[2*3+1];

    var b20 = b[0*3+2];
    var b21 = b[1*3+2];
    var b22 = b[2*3+2];


    // ----------------------------------------------------------
    // Faz a multiplicação das matrizes.
    //
    // Cada elemento da matriz resultado é obtido
    // multiplicando uma linha pela coluna correspondente.
    //
    // resultado = A * B
    // ----------------------------------------------------------

    return [

      // 1ª coluna do resultado
      a00*b00 + a01*b10 + a02*b20,
      a10*b00 + a11*b10 + a12*b20,
      a20*b00 + a21*b10 + a22*b20,

      // 2ª coluna do resultado
      a00*b01 + a01*b11 + a02*b21,
      a10*b01 + a11*b11 + a12*b21,
      a20*b01 + a21*b11 + a22*b21,

      // 3ª coluna do resultado
      a00*b02 + a01*b12 + a02*b22,
      a10*b02 + a11*b12 + a12*b22,
      a20*b02 + a21*b12 + a22*b22
    ];
  },


  // ============================================================
  // translation(tx, ty)
  // ============================================================
  // Cria e retorna uma matriz de translação.
  //
  // tx = quanto deslocar no eixo X
  // ty = quanto deslocar no eixo Y
  //
  // Essa matriz, quando aplicada a um ponto:
  //
  //     (x, y)
  //
  // transforma em:
  //
  //     (x + tx, y + ty)
  //
  translation: function(tx,ty){
    return [
      1,  0,  0,
      0,  1,  0,
      tx, ty, 1
    ];
  },


  // ============================================================
  // scaling(sx, sy)
  // ============================================================
  // Cria e retorna uma matriz de escala.
  //
  // sx = fator de escala no eixo X
  // sy = fator de escala no eixo Y
  //
  // Exemplos:
  //
  // sx = 2  -> dobra a largura
  // sy = 0.5 -> reduz a altura pela metade
  //
  scaling: function(sx,sy){
    return [
      sx, 0,  0,
      0,  sy, 0,
      0,  0,  1
    ];
  },


  // ============================================================
  // rotation(angleInRadians)
  // ============================================================
  // Cria e retorna uma matriz de rotação.
  //
  // angleInRadians = ângulo da rotação em RADIANTES.
  //
  // Math.cos() e Math.sin() do JavaScript trabalham
  // com ângulos em radianos.
  //
  // A matriz utilizada é:
  //
  // |  cos θ   sin θ   0 |
  // | -sin θ   cos θ   0 |
  // |   0        0     1 |
  //
  rotation: function(angleInRadians){

    // Calcula o cosseno do ângulo.
    var c = Math.cos(angleInRadians);

    // Calcula o seno do ângulo.
    var s = Math.sin(angleInRadians);

    return [
         c, s, 0,
        -s, c, 0,
         0, 0, 1
    ];
  },


  // ============================================================
  // translate(m, tx, ty)
  // ============================================================
  // NÃO cria apenas uma matriz de translação.
  //
  // Ela pega uma matriz existente "m" e aplica
  // uma translação nela.
  //
  // Primeiro cria a matriz de translação:
  //
  //     t = T(tx, ty)
  //
  // Depois faz:
  //
  //     t * m
  //
  // Ou seja, combina a translação com a transformação
  // que já estava em "m".
  translate: function(m,tx,ty){

    // Cria a matriz de translação.
    var t = m3.translation(tx,ty);

    // Multiplica a translação pela matriz existente.
    return m3.multiply(t,m);
  },


  // ============================================================
  // scale(m, sx, sy)
  // ============================================================
  // Aplica uma escala à matriz "m".
  //
  // Primeiro cria uma matriz de escala:
  //
  //     s = S(sx, sy)
  //
  // Depois faz:
  //
  //     s * m
  //
  // Assim, a nova transformação é combinada
  // com a transformação anterior.
  scale: function(m,sx,sy){

    // Cria a matriz de escala.
    var s = m3.scaling(sx,sy);

    // Combina a escala com a matriz existente.
    return m3.multiply(s,m);
  },


  // ============================================================
  // rotate(m, angleInRadians)
  // ============================================================
  // Aplica uma rotação à matriz "m".
  //
  // Primeiro cria uma matriz de rotação:
  //
  //     r = R(ângulo)
  //
  // Depois faz:
  //
  //     r * m
  //
  // O ângulo deve estar em radianos.
  rotate: function(m,angleInRadians){

    // Cria a matriz de rotação.
    var r = m3.rotation(angleInRadians);

    // Combina a rotação com a matriz existente.
    return m3.multiply(r,m);
  }

};
