class Papa {
	pixeles = [];

	xMinima = 0;
	xMaxima = 0;
	yMinima = 0;
	yMaxima = 0;

	grados = 0;

	constructor(x, y) {
		this.agregarPixel(x, y);
		this.xMinima = x;
		this.xMaxima = x;
		this.yMinima = y;
		this.yMaxima = y;
	}

	agregarPixel(x, y) {
		this.pixeles.push( {x: x, y: y} );

		if (x < this.xMinima) {
			this.xMinima = x;
		}
		if (x > this.xMaxima) {
			this.xMaxima = x;
		}
		this.yMinima = y < this.yMinima ? y : this.yMinima;
		this.yMaxima = y > this.yMaxima ? y : this.yMaxima;
	}

	estaCerca(x, y) {
		if (x >= this.xMinima && x <= this.xMaxima &&
			y >= this.yMinima && y <= this.yMaxima) {

			return true;
		}
		var distX = 0;
		var distY = 0;

		if (x < this.xMinima) {
			distX = this.xMinima - x;
		}
		if (x > this.xMaxima) {
			distX = x - this.xMaxima;
		}
		if (y < this.yMinima) {
			distY = this.yMinima - y;
		}
		if (y > this.yMaxima) {
			distY = y - this.yMaxima;
		}

		var distancia = distX + distY;

		return distancia < 50;
	}

	dibujar(ctx) {
		ctx.strokeStyle="#f00";
		ctx.lineWidth = 4;
		ctx.beginPath();
		var x = this.xMinima;
		var y = this.yMinima;
		var width = this.xMaxima - this.xMinima;
		var height = this.yMaxima - this.yMinima;

		ctx.rect(x, y, width, height);
		ctx.stroke();

		var centroX = x + (width/2);
		var centroY = y + (height/2);

		ctx.beginPath();
		ctx.fillStyle="#00f";
		ctx.arc(centroX, centroY, 5, 0, 2*Math.PI);
		ctx.fill();

		var sumaYIzq = 0;
		var cuentaYIzq = 0;
		var sumaYDer = 0;
		var cuentaYDer = 0;

		for(var p=0; p<this.pixeles.length; p++){
			if (this.pixeles[p].x <= (x + (width*.1))){
				sumaYIzq += this.pixeles[p].y;
				cuentaYIzq++;		
			}else if (this.pixeles[p].x >= (x + (width*.9))){
				sumaYDer += this.pixeles[p].y;
				cuentaYDer++;
			}
		}

		ctx.beginPath();
		ctx.fillStyle="#00f";
		ctx.arc(this.xMinima, (sumaYIzq/cuentaYIzq), 5, 0, 2*Math.PI);
		ctx.fill();

		ctx.beginPath();
		ctx.fillStyle="#00f";
		ctx.arc(this.xMaxima, (sumaYDer/cuentaYDer), 5, 0, 2*Math.PI);
		ctx.fill();

		ctx.beginPath();
		ctx.strokeStyle = "#0f0";
		ctx.moveTo(this.xMinima, (sumaYIzq/cuentaYIzq));
		ctx.lineTo(this.xMaxima, (sumaYDer/cuentaYDer));
		ctx.stroke();

		var diffY = (sumaYDer/cuentaYDer) - (sumaYIzq/cuentaYIzq);
		var diffX = this.xMaxima - this.xMinima;

		var radianes = Math.atan(diffY/diffX);
		var grados = radianes * (180/Math.PI);
		grados = Math.round(grados);
		//console.log(grados);

		this.grados = grados;
	}
}