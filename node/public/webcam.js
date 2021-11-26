var video;
var canvas;

var altoCamara = 720;
var anchoCamara = 720;

var rojob = {r:255, g:0, b:0};

var distanciaAceptableColor = 150;

var sensibilidadGiro = 1.3;

function mostrarCamara() {
	video = document.getElementById("video");
	canvas = document.getElementById("canvas");

	var opciones = {
		audio: false,
		video: {
			width: anchoCamara, height: altoCamara
		}
	};

	if(navigator.mediaDevices.getUserMedia) {
		navigator.mediaDevices.getUserMedia(opciones)
		    .then(function(stream) {
		    	video.srcObject = stream;
		    	procesarCamara();
		    })
		    .catch(function(err) {
		    	console.log("Oops, hubo un error", err);
		    })
	} else {
		console.log("No existe la funcion getUserMedia... oops :( ");
	}
}

function procesarCamara() {
	var ctx = canvas.getContext("2d");

	ctx.drawImage(video, 0, 0, anchoCamara, altoCamara, 0, 0, canvas.width, canvas.height);

	var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	var pixeles = imgData.data;

	var papas = [];

	for (var p=0; p < pixeles.length; p += 4) {
		var rojo = pixeles[p];
		var verde = pixeles[p+1];
		var azul = pixeles[p+2];
		var alpha = pixeles[p+3];

		var distancia = Math.sqrt(
			Math.pow(rojob.r-rojo, 2) +
			Math.pow(rojob.g-verde,2) +
			Math.pow(rojob.b-azul, 2)
		);

		if (distancia < distanciaAceptableColor) {
			var y = Math.floor(p / 4 / canvas.width);
			var x = (p/4) % canvas.width;

			if (papas.length == 0) {
				var papa = new Papa(x, y);
				papas.push(papa);
			} else {
				var encontrado = false;
				for (var pl=0; pl < papas.length; pl++) {
					if (papas[pl].estaCerca(x, y)) {
						papas[pl].agregarPixel(x, y);
						encontrado = true;
						break;
					}
				}

				if (!encontrado) {
					var papa = new Papa(x, y);
					papas.push(papa);
				}
			}
		}
	}

	ctx.putImageData(imgData, 0, 0);

	papas = unirPapas(papas);

	var masGrande = null;
	var mayorTamano = -1;

	for (var pl=0; pl < papas.length; pl++) {
		var width = papas[pl].xMaxima - papas[pl].xMinima;
		var height = papas[pl].yMaxima - papas[pl].yMinima;
		var area = width * height;

		if (area > 1500) {
			if(masGrande == null || area > mayorTamano){
				masGrande = papas[pl];
				mayorTamano = area;
			}
		    //papas[pl].dibujar(ctx);
		}
	}

	if(masGrande != null){
		masGrande.dibujar(ctx);

		document.getElementById("info").innerHTML = masGrande.grados;
		var base = 0;
		var nuevosGrados = (base + (masGrande.grados*-1)) * sensibilidadGiro;
		document.getElementById("nave")
			.style.transform="rotate("+ nuevosGrados + "deg";

		var ancho = masGrande.xMaxima - masGrande.xMinima;

		enviarMovimiento(masGrande.grados, masGrande.yMinima);
	}
	
	setTimeout(procesarCamara, 20);
}

function unirPapas(papas) {
	var salir = false;

	for (var p1=0; p1 < papas.length; p1++)  {
		for (var p2=0; p2 < papas.length; p2++) {

			if (p1 == p2) continue;

			var papa1 = papas[p1];
			var papa2 = papas[p2];

			var intersectan = papa1.xMinima < papa2.xMaxima &&
				papa1.xMaxima > papa2.xMinima &&
			    papa1.yMinima < papa2.yMaxima && 
			    papa1.yMaxima > papa2.yMinima;

		    if (intersectan) {
		    	for (var p=0; p < papa2.pixeles.length; p++) {
		    		papa1.agregarPixel(
		    			papa2.pixeles[p].x,
		    			papa2.pixeles[p].y
	    			);
		    	}
		    	papas.splice(p2, 1);
		    	salir = true;
		    	break;
		    }

		}

		if (salir) {
			break;
		}
	}
	if (salir) {
		return unirPapas(papas);
	} else {
		return papas;
	}
}

var ultimoUrl = null;

function enviarMovimiento(grados, yMinima, ancho){
	var movimiento ="0";
	if (grados >= 18){
		movimiento = "-1"
	}else if (grados <= -18){
		movimiento = "1";
	}

	var brincar = 0;
	if(yMinima <= 30){
		brincar = "1";
	}

	var acelerar = "0";
	if(ancho>=240){
		acelerar = "1";
	}

	var url = "http://localhost:3000?movimiento=" + movimiento + "&brincar=" + brincar + "&acelerar=" + acelerar;
	
	if (ultimoUrl == null || url != ultimoUrl){
		ultimoUrl = url;
		$.get(url, function(response){
			console.log(response);
		});
	}

	
}