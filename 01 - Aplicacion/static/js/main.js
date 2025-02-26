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
      $('#resultado').append('<h4> Valor del Ejemplo: </h4>');
      $('#resultado').append('<pre> Ejemplo cargado del fichero: ' + JSON.stringify(dataEjemplo, function (key, val) {
        return val.toFixed ? Number(val.toFixed(3)) : val;
      }, 7) + '</pre>');

      $('#testIris').prop('disabled', true); // Desactiva el boton de carga de fichero de Ejemplos
    };
    reader.readAsText(input.files[0]);
    $('#startKMedias').prop('disabled', false);
    $('#startBayes').prop('disabled', false);
    $('#startlloyd').prop('disabled', false);
  });
  // ---------------------------------------------------------------------------

    /* BOTON METODO DE K-MEDIAS ---------------------------------*/
  $('#startKMedias').click(function (event) {
    $('#startKMedias').prop('disabled', true);
    $('#startBayes').prop('disabled', true);
    $('#startlloyd').prop('disabled', true);
    console.log('---------- Comienzo de la aplicacion ----------');
    $('#resultado').append('<h4> COMIENZO DEL METODO K-MEDIAS </h4>');

    console.log('-- Centros de Iris-Setosa: ');
    console.log(centrosSetosa);
    console.log('-- Centros de Iris-VersiColor: ');
    console.log(centrosVersi);
    console.log('Iniciando Entrenamiento...')

    $('#resultado').append('<p>- Tolerancia: ' + KTolerancia + '</p>');
    $('#resultado').append('<p>- Peso Exponencial: ' + KPesoExponencial_b + '</p>');

    k_medias();
    console.log('Entrenamiento acababado')
    console.log('--------- Valores de Centro Setosa y Centro Versicolor -------');
    console.log(centrosSetosa);
    console.log(centrosVersi);

    var resultado = resultadoKMedias(dataEjemplo);

    console.log('El resultado es: ' + resultado);
    $('#resultado').append('<h5 class="mt-3 mb-3"> Pertenece a la clase: ' + resultado + '</h5>')
  });

  /* FUNCIONES ASISTENTES PARA EL METODO K-MEDIAS */
  function k_medias() { //Funcion del Metodo de Ordenacion de KMedias
    var salir = false; // indica si se han llegado a las condiciones
    var iteracion = 1;
    while (!salir) { // Hace el numero de iteraciones hasta que se hayan cumplido las condiciones.
      console.log('Iteracion numero: ' + iteracion);
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

      var MatrizProbabilidadesK = []; // Matriz de probabilidades
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
      $('#resultado').append('<h4> Iteraci&oacuten n&uacutemero: ' + iteracion + '</h4>')
      $('#resultado').append('<pre> Nuevo centro Iris-setosa: ' + JSON.stringify(nuevoCentroSetosa, function (key, val) {
        return val.toFixed ? Number(val.toFixed(3)) : val;
      }, 7) + '</pre>');
      $('#resultado').append('<pre> Nuevo centro Iris-Versicolor: ' + JSON.stringify(nuevoCentroVersi, function (key, val) {
        return val.toFixed ? Number(val.toFixed(3)) : val;
      }, 7) + '</pre>');

      salir = criterioConver(nuevoCentroSetosa, nuevoCentroVersi);
      centrosVersi = nuevoCentroVersi;
      centrosSetosa = nuevoCentroSetosa;
     

      console.log('Nuevo Centro Cetosa: ---- ');
      console.log(centrosSetosa)
      console.log('Nuevo Centro Versicolor: ---- ');
      console.log(centrosVersi)
      iteracion++;
    }
  }

  function criterioConver(nuevoCentroSetosa, nuevoCentroVersi) { // Compruba si se cumplen las condiciones de los nuevos centros o si se tiene que seguir iterando
    let i = 0;
    var aux1 = 0;
    $('#resultado').append('<h6> Aplicacion del criterio de convergencia: <h6>');
    while (i < centrosSetosa.length) { //Comprueba el centro de Iris-Setosa
      var value = Math.pow(nuevoCentroSetosa[i] - centrosSetosa[i], 2);
      aux1 += Math.pow(nuevoCentroSetosa[i] - centrosSetosa[i], 2);
      i++;
    }
    if (Math.sqrt(aux1) > KTolerancia) {
      $('#resultado').append('<strong> Iris Setosa: </strong><br>');
      $('#resultado').append(Math.sqrt(aux1) + ' > ' + KTolerancia + '<br>');
      $('#resultado').append('(Se continua Iterando)<br>');
      return false; // Continua iterando
    }
    else {
      $('#resultado').append('<strong> Iris Setosa: </strong><br>');
      $('#resultado').append(Math.sqrt(aux1) + ' < ' + KTolerancia + '<br>');
      let j = 0;
      var aux2 = 0;
      while (j < centrosVersi.length) { // Comprueba el centro Iris-Versicolor
        aux2 += Math.pow(nuevoCentroVersi[j] - centrosVersi[j], 2);
        j++;
      }
      if (Math.sqrt(aux2) > KTolerancia) {
        $('#resultado').append('<strong> Iris Versicolor: </strong><br>');
        $('#resultado').append(Math.sqrt(aux2) + ' > ' + KTolerancia + '<br>');
        $('#resultado').append('(Se continua Iterando)<br>');
        return false; // Continua iterando
      }
    }
    $('#resultado').append('<strong> Iris Versicolor: </strong><br>');
    $('#resultado').append(Math.sqrt(aux2) + ' < ' + KTolerancia + '<br>');
    $('#resultado').append('Se ha llegado al final de las iteraciones<br>');
    return true; // Se acabo iterars
  }

  function resultadoKMedias(ejemplo) { // Devuelve la clase resultante del metodo de K-Medias
    var resultSetosa = 0;
    var resultVersiColor = 0;
    for (let i = 0; i < centrosSetosa.length; i++) {
      resultSetosa += Math.pow(ejemplo[i] - centrosSetosa[i], 2);
    }
    for (let i = 0; i < centrosSetosa.length; i++) {
      resultVersiColor += Math.pow(ejemplo[i] - centrosVersi[i], 2);
    }
    if (resultSetosa < resultVersiColor) {
      return 'Iris-setosa';
    }
    else {
      return 'Iris-versicolor';
    }
  }


    /* BOTON METODO DE BAYES ---------------------------------*/
    $('#startBayes').click(function (event) { // Aqui se encuentra la implementacion del metodo de Bayes
      //Desactivacion de los botones
     $('#startKMedias').prop('disabled', true);
     $('#startBayes').prop('disabled', true);
     $('#startlloyd').prop('disabled', true);
 
     /* Calculo de las medias */
     $('#resultado').append('<h4> COMIENZO DEL METODO DE BAYES </h4>');
 
     for (let i = 0; i < irisSetosa[0].length; i++) { // Suma de Iris-Setosa (Se suman a la vez dado que tienen el mismo numero de elementos)
       let auxSetosa = 0;
       let auxVersiColor = 0;
       for (let j = 0; j < irisSetosa.length; j++) {
         auxSetosa += irisSetosa[j][i];
         auxVersiColor += irisVersicolor[j][i];
       }
       mediaSetosa.push(auxSetosa * (1 / irisSetosa.length));
       mediaVersiColor.push(auxVersiColor * (1 / irisVersicolor.length));
     }
     console.log('Media de Iris-Setosa ----------')
     console.log(mediaSetosa);
     $('#resultado').append('<pre> Media Iris-Setosa: ' + JSON.stringify(mediaSetosa, function (key, val) {
       return val.toFixed ? Number(val.toFixed(3)) : val;
     }, 7) + '</pre>');
 
     console.log('Media de Iris-VersiColor ----------')
     console.log(mediaVersiColor);
     $('#resultado').append('<pre> Media Iris-VersiColor: ' + JSON.stringify(mediaVersiColor, function (key, val) {
       return val.toFixed ? Number(val.toFixed(3)) : val;
     }, 7) + '</pre>');
 
     let restoSetosa = [];
     let restoVersiColor = [];
     for (let i = 0; i < mediaSetosa.length; i++) {
       restoSetosa.push(dataEjemplo[i] - mediaSetosa[i]);
       restoVersiColor.push(dataEjemplo[i] - mediaVersiColor[i]);
     }
     let d_Setosa = 0;
     let d_VersiColor = 0;
     for (let i = 0; i < restoSetosa.length; i++) {
       d_Setosa += Math.pow(restoSetosa[i], 2);
       d_VersiColor += Math.pow(restoVersiColor[i], 2);
     }
 
     console.log('Result Setosa -----');
     console.log(d_Setosa);
     $('#resultado').append('<h4> Distancia Iris-Setosa: ' + d_Setosa + '</h4>')
 
     console.log('Result VersiColor -----');
     console.log(d_VersiColor);
     $('#resultado').append('<h4> Distancia Iris-VersiColor: ' + d_VersiColor + '</h4>')
 
 
 
     var resultado = '';
     if (d_Setosa < d_VersiColor) {
       resultado = 'Iris-setosa';
     }
     else {
       resultado = 'Iris-versicolor';
     }
 
 
     console.log('El resultado es: ' + resultado);
     $('#resultado').append('<h5 class="mt-3 mb-3"> Pertenece a la clase: ' + resultado + '</h5>')
   });
});