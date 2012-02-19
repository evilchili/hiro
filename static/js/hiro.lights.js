BoardPlugins.push( { 'property' : 'lights', 'func' : function(board) {
	var self = this;

	self.default_brightness = 0.1;

	self.add_light = function( args ) {

		if ( args.x < board.cols && args.y < board.rows ) {
			t = board.map[ args.y ][ args.x ];

			t.light = args;
	
			// apply the brightness to the color
			t.light.color = darken( t.light.color, 1 - t.light.brightness );

			if ( args.falloff > 0 ) {
				tiles = t.neighbours();
				for ( var i in tiles ) {
					if ( tiles[i] ) {
						tiles[i].light = { 
							brightness : args.brightness,
							color      : darken( args.color, args.falloff ),
						};
					}
				}
				tiles.C = t;
			} else {
				tiles = [ t ];
			}
		}
	};

	board.add_hook( 'new_tile_start', function(tile) {
		if ( tile.light == undefined ) {
			tile.light = { 
				brightness : self.default_brightness,
				color      : '#000000',
				alpha      : 1 - self.default_brightness,
			}
		}
		return tile;
	});

	board.add_hook( 'tile_draw_surface_end', function( args ) {

		p = args.point;
		c = args.context;
		t = args.tile;

		c.beginPath();
		c.globalAlpha = t.light.alpha || ( t.light.brightness ? 0.5 : 1 );

		c.fillStyle = t.style =='hidden' ? t.style.fillStyle : t.light.color;
		c.moveTo( p.w.x,  p.w.y  );
		c.lineTo( p.nw.x, p.nw.y ); 
		c.lineTo( p.ne.x, p.ne.y ); 
		c.lineTo( p.e.x,  p.e.y  ); 
		c.lineTo( p.se.x, p.se.y ); 
		c.lineTo( p.sw.x, p.sw.y  ); 
		c.closePath();
		c.fill();

	});
	return self;

}});


function darken( hex, lum ) {
	return ColorLuminance( hex, -1 * lum );
}

function lighten( hex, lum ) {
	return ColorLuminance( hex,lum );
}

// source: http://www.sitepoint.com/javascript-generate-lighter-darker-color/
//
// return lighter (+lum) or darker (-lum) color as a hex string
// pass original hex string and luminosity factor, e.g. -0.1 = 10% darker
function ColorLuminance(hex, lum) {
	// validate hex string
	hex = String(hex).replace(/[^0-9a-f]/gi, '');
	if (hex.length < 6) {
		hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
	}
	lum = lum || 0;
	// convert to decimal and change luminosity
	var rgb = "#", c, i;
	for (i = 0; i < 3; i++) {
		c = parseInt(hex.substr(i*2,2), 16);
		c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
		rgb += ("00"+c).substr(c.length);
	}
	return rgb;
}

