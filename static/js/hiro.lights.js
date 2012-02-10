BoardPlugins.push( { 'property' : 'lights', 'func' : function(board) {
	var self = this;

	pos = board.get_layer_position('ui');
	light_layer = board.add_layer('lights', pos );
	light_layer.listen(false);
	board.reset_stage();

	board.add_light = function( args ) {

		if ( args.x < board.cols && args.y < board.rows ) {
			t = board.map[ args.y ][ args.x ];
			t.light = args;
			t.brightness = args.brightness;
			if ( args.falloff > 0 ) {
				tiles = t.neighbours();
				for ( var i in tiles ) {
					tiles[i].light = { 
						brightness : args.brightness / ( args.falloff + 1 ),
						color      : args.color,
					};
				}
				tiles.C = t;
			} else {
				tiles = [ t ];
			}
		}
		for ( var i in tiles ) {
			board.execute_hooks( 'tile_draw_end', tiles[i] );
		}
	};

	board.add_hook( 'tile_draw_end', function(tile) {
		if ( ! tile.light ) return;
		var c = light_layer.getContext();
		var p = tile.get_screen_coords();
		c.beginPath();
		c.globalCompositeOperation = 'lighter';
		c.globalAlpha = tile.light.brightness;
		c.fillStyle = tile.light.color;
		c.moveTo( p.w.x,  p.w.y  );
		c.lineTo( p.nw.x, p.nw.y ); 
		c.lineTo( p.ne.x, p.ne.y ); 
		c.lineTo( p.e.x,  p.e.y  ); 
		c.lineTo( p.se.x, p.se.y ); 
		c.lineTo( p.sw.x, p.sw.y  ); 
		c.closePath();
		c.fill();
	});

		/*
	light_layer.add( new Kinetic.Shape( function() {
		var c = this.getContext();
		c.globalCompositeOperation = 'darker';
		c.beginPath();
		c.fillStyle='#000';
		c.globalAlpha = 0.70;
		c.fillRect(0, 0, board.pixelwidth, board.pixelheight );
		c.closePath();
	}) );
	light_layer.draw();
		*/

} } );

