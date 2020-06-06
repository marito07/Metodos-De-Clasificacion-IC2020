$(function () {
  /* Valores de lectura */
  var irisSetosa = [];
  var irisVersicolor = [];
  var dataEjemplo = [];

  /* Valores de para K-Medias */
  var centrosSetosa = [4.6, 3.0, 4.0, 0.0];
  var centrosVersi = [6.8, 3.4, 4.6, 0.7];
  var KTolerancia = 0.01;
  var KPesoExponencial_b = 2;

  /* Valores de para Bayes */
  var matrizCovSetosa = [];
  var matrizCovVersiColor = [];
  var mediaSetosa = [];
  var mediaVersiColor = [];


  $('#startKMedias').prop('disabled', true); 
  $('#startBayes').prop('disabled', true); 
  $('#startlloyd').prop('disabled', true); 
  $('#testIris').prop('disabled', true); 

  // Lectura de datos ----------------------------------------------------------
  $('#iris2clases').change(function () { // Carga las clases Iris-Setosa e Iris-Versicolor del archivo "Iris2Clases.txt"
    var input = event.target;
    var reader = new FileReader();
    reader.onload = function () {
      var lines = this.result.split('\n');

      for (var line = 0; line < lines.length; line++) {
        if (lines[line].trim() != "") {
          var auxArray = lines[line].split(',');
          var ejem = [];
          for (let i = 0; i < auxArray.length - 1; i++) {
            ejem.push(Number(auxArray[i]));
          }
          if (auxArray[auxArray.length - 1].trim() == 'Iris-setosa') {
            irisSetosa.push(ejem);
          }
          else {
            irisVersicolor.push(ejem);
          }


        }
      }
      console.log('---------- Clases cargadas ----------');
      console.log('Clase Iris-Setosa:');
      console.log(irisSetosa);
      console.log('Clase Iris-Versicolor:');
      console.log(irisVersicolor);
      $('#iris2clases').prop('disabled', true); // Desactiva el botón de carga de las clases
      $('#testIris').prop('disabled', false); 

    };
    reader.readAsText(input.files[0]);
  });
  $('#testIris').change(function () { // Carga el fichero de ejemplo, (TestIris01.txt, TestIris02.txt, TestIris03.txt)
    var input = event.target;
    var reader = new FileReader();
    reader.onload = function () {
      var line = this.result.trim();
      var auxArray = line.split(',');
      for (var i = 0; i < auxArray.length - 1; i++) {
        dataEjemplo.push(Number(auxArray[i]));
      }

      console.log("--- Lista de Ejemplo cargada ---");
      console.log(dataEjemplo);
      $('#testIris').prop('disabled', true); // Desactiva el boton de carga de fichero de Ejemplos
    };
    reader.readAsText(input.files[0]);
    $('#startKMedias').prop('disabled', false); 
    $('#startBayes').prop('disabled', false); 
    $('#startlloyd').prop('disabled', false); 
  });
  // ---------------------------------------------------------------------------
  $('#startKMedias').click(function (event) {
    $('#startKMedias').prop('disabled', true); 
    $('#startBayes').prop('disabled', true); 
    $('#startlloyd').prop('disabled', true); 
    console.log('---------- Comienzo de la aplicacion ----------');
    console.log('-- Centros de Iris-Setosa: ');
    console.log(centrosSetosa);
    console.log('-- Centros de Iris-VersiColor: ');
    console.log(centrosVersi);
    console.log('Iniciando Entrenamiento...')

    calcularMatProbabilidadesK();
    console.log('Entrenamiento acababado')
    console.log('--------- Valores de Centro Setosa y Centro Versicolor -------');
    console.log(centrosSetosa);
    console.log(centrosVersi);

    var resultado = resultadoKMedias(dataEjemplo);

    console.log('El resultado es: ' + resultado);
    $('#resultado').append('<h5> El resultado es: ' + resultado + '</h5>')
  });

  $('#startBayes').click(function (event) {
    $('#startKMedias').prop('disabled', true); 
    $('#startBayes').prop('disabled', true); 
    $('#startlloyd').prop('disabled', true); 

    /* Calculo de las medias */
    
    for(let i = 0; i < irisSetosa[0].length; i++){ // Suma de Iris-Setosa (Se suman a la vez dado que tienen el mismo numero de elementos)
      let auxSetosa = 0;
      let auxVersiColor = 0;
      for(let j = 0; j < irisSetosa.length; j++) {
        auxSetosa += irisSetosa[j][i];
        auxVersiColor += irisVersicolor[j][i];
      }
      mediaSetosa.push(auxSetosa*(1/irisSetosa.length));
      mediaVersiColor.push(auxVersiColor*(1/irisVersicolor.length));
    }
    console.log('Media de Iris-Setosa ----------')
    console.log(mediaSetosa);
    console.log('Media de Iris-VersiColor ----------')
    console.log(mediaVersiColor);

    let restoSetosa = [];
    let restoVersiColor = [];
    for(let i = 0; i < mediaSetosa.length; i++) {
      restoSetosa.push(dataEjemplo[i] - mediaSetosa[i]);
      restoVersiColor.push(dataEjemplo[i] - mediaVersiColor[i]);
    }
    let d_Setosa = 0;
    let d_VersiColor = 0;
    for(let i = 0; i < restoSetosa.length; i++) {
      d_Setosa += Math.pow(restoSetosa[i], 2);
      d_VersiColor += Math.pow(restoVersiColor[i], 2);
    }

    console.log('Result Setosa -----');
    console.log(d_Setosa);
    console.log('Result VersiColor -----');
    console.log(d_VersiColor);


    var resultado = '';
    if(d_Setosa < d_VersiColor){
      resultado = 'Iris-setosa';
    }
    else{
      resultado = 'Iris-versicolor';
    }

    console.log('El resultado es: ' + resultado);
    $('#resultado').append('<h5> El resultado es: ' + resultado + '</h5>')
  });

  function calcularMatProbabilidadesK() {
    var salir = false; // indica si se han llegado a las condiciones
    // let pruebaMag = 0;
    while (!salir) {
      const exponente = 1 / (KPesoExponencial_b - 1); // 1/(b-1)
      // Si hay el mismo numero de elementos en las 2 clases entonces basta con resolverlo 
      // para una de ellas y el resultado de la otra sera la resta de ese valor a 1
      var valores_d = [];
      for (let i = 0; i < irisSetosa.length; i++) { // Se calculan los valores de d para irisSetosa
        var res = [];
        var djSetosa = 0;
        var djVersicolor = 0;
        for (let j = 0; j < irisSetosa[i].length; j++) {
          djSetosa += Math.pow(irisSetosa[i][j] - centrosSetosa[j], 2);
          djVersicolor += Math.pow(irisSetosa[i][j] - centrosVersi[j], 2);
        }
        res.push(djSetosa); // valor [0] del array === Setosa
        res.push(djVersicolor); // valor [1] del array === VersiColor
        valores_d.push(res);
      }

      for (let i = 0; i < irisVersicolor.length; i++) { // Se calculan los valores de d para irisVersicolor
        var res = [];
        var djSetosa = 0;
        var djVersicolor = 0;
        for (let j = 0; j < irisVersicolor[i].length; j++) {
          djSetosa += Math.pow(irisVersicolor[i][j] - centrosSetosa[j], 2);
          djVersicolor += Math.pow(irisVersicolor[i][j] - centrosVersi[j], 2);
        }
        res.push(djSetosa); // valor [0] del array === Setosa
        res.push(djVersicolor); // valor [1] del array === VersiColor
        valores_d.push(res);
      }

      var MatrizProbabilidadesK = [];
      var sumasDeterminantes = [];
      for (let i = 0; i < valores_d.length; i++) {
        var auxi = 0;
        for (let j = 0; j < 2; j++) {
          auxi += Math.pow(1 / valores_d[i][j], exponente)
        }
        sumasDeterminantes.push(auxi);
      }


      for (let i = 0; i < valores_d.length; i++) {
        var aux = [];
        var res = Math.pow(1 / valores_d[i][0], exponente) / sumasDeterminantes[i];
        aux.push(res);
        aux.push(1 - res);
        MatrizProbabilidadesK.push(aux);
      }
      console.log('Matriz de Prob ---------------------');
      console.log(MatrizProbabilidadesK);


      var nuevoCentroSetosa = [];
      var nuevoCentroVersi = [];

      for (let i = 0; i < centrosSetosa.length; i++) { // Nuevo Centro para la clase Iris Setosa
        var aux1 = 0;
        var aux2 = 0;
        for (let j = 0; j < irisSetosa.length; j++) {
          aux1 += Math.pow(MatrizProbabilidadesK[j][0], KPesoExponencial_b) * irisSetosa[j][i];
          aux2 += Math.pow(MatrizProbabilidadesK[j][0], KPesoExponencial_b);
        }
        for (let j = 0; j < irisVersicolor.length; j++) {
          aux1 += Math.pow(MatrizProbabilidadesK[irisSetosa.length + j][0], KPesoExponencial_b) * irisVersicolor[j][i];
          aux2 += Math.pow(MatrizProbabilidadesK[irisSetosa.length + j][0], KPesoExponencial_b);
        }
        nuevoCentroSetosa.push(aux1 / aux2);
      }

      for (let i = 0; i < centrosVersi.length; i++) { // Nuevo centro para la lase Iris Versicolor
        var aux1 = 0;
        var aux2 = 0;
        for (let j = 0; j < irisSetosa.length; j++) {
          aux1 += Math.pow(MatrizProbabilidadesK[j][1], KPesoExponencial_b) * irisSetosa[j][i];
          aux2 += Math.pow(MatrizProbabilidadesK[j][1], KPesoExponencial_b);
        }
        for (let j = 0; j < irisVersicolor.length; j++) {
          aux1 += Math.pow(MatrizProbabilidadesK[irisSetosa.length + j][1], KPesoExponencial_b) * irisVersicolor[j][i];
          aux2 += Math.pow(MatrizProbabilidadesK[irisSetosa.length + j][1], KPesoExponencial_b);
        }
        nuevoCentroVersi.push(aux1 / aux2);
      }
      salir = criterioConver(nuevoCentroSetosa, nuevoCentroVersi);
      centrosVersi = nuevoCentroVersi;
      centrosSetosa = nuevoCentroSetosa;
      console.log('Nuevo Centro Cetosa: ---- ');
      console.log(centrosSetosa)
      console.log('Nuevo Centro Versicolor: ---- ');
      console.log(centrosVersi)
    }
  }


  function criterioConver(nuevoCentroSetosa, nuevoCentroVersi) {
    let i = 0;
    var aux1 = 0;
    console.log('Creterio de convergencia: '+ centrosSetosa.length);
    while (i < centrosSetosa.length) {
      var value =  Math.pow(nuevoCentroSetosa[i] - centrosSetosa[i], 2);
      console.log('Nuevo centro: ' + value);
      aux1 += Math.pow(nuevoCentroSetosa[i] - centrosSetosa[i], 2);
      i++;
    }
    console.log(Math.sqrt(aux1))
    if (Math.sqrt(aux1) > KTolerancia) {
      return false;
    }
    else {
      let j = 0;
      var aux2 = 0;
      while (j < centrosVersi.length) {
        aux2 += Math.pow(nuevoCentroVersi[j] - centrosVersi[j], 2);
        j++;
      }
      console.log(Math.sqrt(aux2));
      if (Math.sqrt(aux2) > KTolerancia) {
        return false;
      }
    }
    return true;
  }

  function resultadoKMedias(ejemplo) {
    var resultSetosa = 0;
    var resultVersiColor = 0;
    for(let i = 0; i < centrosSetosa.length; i++) {
      resultSetosa += Math.pow(ejemplo[i]-centrosSetosa[i],2);
    }
    for(let i = 0; i < centrosSetosa.length; i++) {
      resultVersiColor += Math.pow(ejemplo[i]-centrosVersi[i],2);
    }
    if(resultSetosa < resultVersiColor){
      return 'Iris-setosa';
    }
    else{
      return 'Iris-versicolor';
    }
  }
});