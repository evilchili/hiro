/*
 * demo.js
 *
 */


function draw_2dboard() {

	var b = document.createElement('DIV');
	b.id = 'board';
	document.querySelector('body').appendChild(b);

	var board = new Board({ map : [
			[ 0, 1, 1, 1, 0 ],
			[ 1, 1, 1, 1, 1 ],
			[ 1, 1, 1, 1, 1 ],
			[ 1, 1, 1, 1, 1 ],
			[ 0, 0, 1, 0, 0 ],
		], 
		id        : 'board', 
		isometric : false, 
		radius    : 50,
		padding   : 100,
		width     : 300,
		height    : 200,
	});
	console.log(board);
	board.initialize();
	board.add_style( 'highlight', {
		fillStyle     : 'red',
	});
	board.draw();
	board.map[3][3].set_style('disabled');
	return board;
}

function draw_3dboard() {
	
	var b = document.createElement('DIV');
	b.id = 'board3d';
	document.querySelector('#content').appendChild(b);
	var board = new Board({ 
		map : [

			[ 4, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0 ],
			[ 3, 2, 1, 1, 1, 0, 0, 0, 1, 1, 0 ],
			[ 3, 2, 1, 1, 1, 2, 1, 2, 1, 1, 0 ],
			[ 3, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0 ],
			[ 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0 ],
			[ 3, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0 ],
			[ 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1 ],

		], 
		id    	  : 'board3d', 
		isometric : true, 
		is_3d     : true,
		radius    : 40,
		padding   : 20,
		//width     : 500,
		//height    : 350,
		tile_height : 15,	
	}).init();

	// add some tile styles
	board.add_style( 'default', { 
		fillStyle         : '#AAA', 
		strokeStyle       : '#000',
		side_fillStyle    : '#888',
		side_fillStyle2   : '#333',
		side_strokeStyle  : '#333',
	});

	board.add_style( 'disabled', { 
		globalAlpha : 0.5,
		side_globalAlpha : 0.5,
	});

	board.add_style( 'hidden',   { 
		fillStyle         : 'transparent', 
		strokeStyle       : 'transparent', 
		side_fillStyle    : 'transparent',
		side_fillStyle2   : 'transparent',
		side_strokeStyle  : 'transparent',
		side_lineWidth    : 'transparent',
	});

	board.add_style( 'highlight', {
		fillStyle         : 'red',
		side_fillStyle    : '#888',
		side_fillStyle2   : '#333',
		side_strokeStyle  : '#333',
		side_lineWidth    : 1,
	});

	if ( board.lights )

		// by default every tile is dark
		board.lights.default_brightness = 0.1;

		// add a light
		board.lights.add_light({ 
			'x'          : 3, 
			'y'          : 1, 
			'brightness' : 0.75,
			'falloff'    : 0.9,
			'color'      : '#FFFACD',
			'height'     : 2,
		});

	board.draw();

	// disable a tile
	//board.map[3][3].set_style('disabled');

	return board;
}

