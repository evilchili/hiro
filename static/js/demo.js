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
			[ 3, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0 ],
			[ 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1 ],
		], 
		id    	  : 'board3d', 
		isometric : true, 
		is_3d     : true,
		radius    : 40,
		padding   : 50,
		width     : 500,
		height    : 350,
		tile_height : 15,	
	}).init();

	// add some tile styles
	board.add_style( 'default', { 
		fillStyle         : '#333', 
		strokeStyle       : '#111',
		side_fillStyle    : '#222',
		side_fillStyle2   : '#111',
		side_strokeStyle  : '#111',
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
		fillStyle         : '#DDD',
		side_fillStyle    : '#777',
		side_fillStyle2   : '#555',
		side_strokeStyle  : '#AAA',
		side_lineWidth    : 1,
	});

	board.draw();

	// add a light
	board.add_light({ 
		'x'          : 2, 
		'y'          : 2, 
		'brightness' : 0.85,
		'falloff'    : 1, 
		'color'      : '#FFFACD',
		'height'     : 2,
	});

	// disable a tile
	board.map[3][3].set_style('disabled');

	return board;
}

