
//	Board()
//		-- object definition for a game board
var BoardPlugins = [];
var Board = function(args) {

	var self = this;

	self.id 		 = args.id           || null;
	self.isometric   = args.isometric    || false;
	self.is_3d       = args.is_3d        || false;
	self.padding     = args.padding      || 0; 
	self.tile_height = args.tile_height  || 0;
	self.width       = args.width;
	self.height      = args.height;
	self.pixelwidth  = 0;
	self.pixelheight = 0;

	self._layers     = [];
	self._style      = new Object();
	self._tile       = new Object();
	self._hooks      = [];

	/* Board.add_tile()
	 *	-- add a tile at the specified coordinates
	 */
	self.add_tile = function(args) {
		self.map[ args.y ][ args.x ] = args.null ? null : new Tile({ 
			'parent' : self, 
			'x'      : args.x, 
			'y'      : args.y,
			'z'		 : args.z || 1,
			'style'  : 'default',
		});
	};
	
	/* Board.add_style()
	 *	-- add a style definition for tiles on this board
	 */
	self.add_style = function( name, style ) {
		self._style[name] = new Object();
		self._style[name].lineWidth     = style.lineWidth     || 1;
		self._style[name].globalAlpha   = style.globalAlpha   || 1.0;
		self._style[name].strokeStyle   = style.strokeStyle   || "black";
		self._style[name].fillStyle     = style.fillStyle     || "white";
		self._style[name].shadowColor   = style.shadowColor   || null;
		self._style[name].shadowOffsetX = style.shadowOffsetX || null;
		self._style[name].shadowOffsetY = style.shadowOffsetY || null;
		self._style[name].shadowBlur    = style.shadowBlur    || null;

		// 3D tile sides style
		self._style[name].side_lineWidth     = style.side_lineWidth     || 1;
		self._style[name].side_globalAlpha   = style.side_globalAlpha   || 1.0;
		self._style[name].side_strokeStyle   = style.side_strokeStyle   || "#AAA";
		self._style[name].side_fillStyle     = style.side_fillStyle     || "#777";
		self._style[name].side_fillStyle2    = style.side_fillStyle2    || "#555";
	}

	/* Board.draw()
	 *	-- draw every tile on the game board
	 */
	self.draw = function() {
		self.reset_stage();

		var surface = new Kinetic.Shape( function() {
			var c = this.getContext();
			for ( var y=0; y < self.map.length; y++ ) {
				for ( var x=0; x < self.map[0].length; x++ ) {
					var t = self.map[y][x];
					if ( ! t ) continue;

					t = self.execute_hooks( 'new_tile_start', t );

					var style = self._style[ t.style ];

					c.beginPath();

					// apply the current style for this tile
					c.fillStyle     = style.fillStyle;
					c.strokeStyle   = style.strokeStyle;
					c.lineWidth     = style.lineWidth;
					c.globalAlpha   = style.globalAlpha;
					c.shadowColor   = style.shadowColor;
					c.shadowOffsetX = style.shadowOffsetX;
					c.shadowOffsetY = style.shadowOffsetY;
					c.shadowBlur    = style.shadowBlur;
		
					// draw the tile.
					var v = t.vertices();
		
					c.moveTo( v[0].x, v[0].y );
					for ( var i=1; i <v.length; i++ ) {
						c.lineTo( v[i].x, v[i].y );
					}

					c.closePath();
					c.stroke();
					c.fill();

					self.execute_hooks( 'tile_draw_surface_end', { 
						'context' : c, 
						'point'   : v, 
						'tile'    : t, 
					});
				}
			}
		});
		if ( self.is_3d ) {
			var sides3d = new Kinetic.Shape( function() {
				var c = this.getContext();
				for ( var y=0; y < self.map.length; y++ ) {
					for ( var x=0; x < self.map[0].length; x++ ) {
						var t = self.map[y][x];
						if ( ! t ) continue; 
						var style = self._style[ t.style ];

						c.beginPath();
		
						// apply the current style for this tile
						c.fillStyle     = style.side_fillStyle;
						c.strokeStyle   = style.side_strokeStyle;
						c.lineWidth     = style.side_lineWidth;
						c.globalAlpha   = style.side_globalAlpha;
		
						h = t.z * self._tile.height_3d;
		
						var v = t.vertices();
						c.beginPath();
						c.moveTo( v[5].x, v[5].y );
						c.lineTo( v[5].x, v[5].y + h );
						c.lineTo( v[4].x, v[4].y + h );
						c.lineTo( v[4].x, v[4].y );
						c.lineTo( v[5].x, v[5].y );
						c.stroke();
						c.fill()
			
						c.beginPath();
						c.moveTo( v[2].x, v[2].y );
						c.lineTo( v[2].x, v[2].y + h );
						c.lineTo( v[3].x, v[3].y + h );
						c.lineTo( v[3].x, v[3].y );
						c.lineTo( v[2].x, v[2].y );
						c.stroke();
						c.fill()
			
						c.fillStyle = style.side_fillStyle2;
						c.beginPath();
						c.moveTo( v[4].x, v[4].y );
						c.lineTo( v[4].x, v[4].y + h );
						c.lineTo( v[3].x, v[3].y + h );
						c.lineTo( v[3].x, v[3].y );
						c.lineTo( v[4].x, v[4].y );
						c.stroke();
						c.fill();
					}
				}
			});
		}

		self.execute_hooks( 'tile_draw_end', self );

		var tile_layer = self.get_layer('tiles');
		// draw the shapes on the canvas
		tile_layer.add( surface );
		tile_layer.draw();
		if ( self.is_3d ) {
			var sides_layer = self.get_layer('3dtiles');
			sides_layer.add( sides3d );
			sides_layer.draw();
		}

		// set up event listeners
		self.stage.on( "mousemove", function(e) {
			var t = self.fast_tile_at(e);
			if ( t ) {
				t.set_style('highlight');
			}

		});
		self.stage.on( "mouseout", function(e) {
			self.reset_tiles();
		});
		self.stage.on( "click", function(e) {
			var t = self.tile_at(e);
			if ( ! t ) return;

			if ( t.style != 'hidden' && t.style != 'disabled' ) {
				t.set_style('hidden');
			}
		});

	};

	self.reset_tiles = function() {
		for ( var y=0; y < self.map.length; y++ ) {
			for ( var x=0; x < self.map[0].length; x++ ) {
				if ( self.map[y][x] && self.map[y][x].style == 'highlight' ) 
					self.map[y][x].set_style('default');
			}
		}
	};

/*
 public void setCellByPoint(int x, int y) {
        int ci = (int)Math.floor((float)x/(float)SIDE);
        int cx = x - SIDE*ci;

        int ty = y - (ci % 2) * HEIGHT / 2;
        int cj = (int)Math.floor((float)ty/(float)HEIGHT);
        int cy = ty - HEIGHT*cj;

        if (cx > Math.abs(RADIUS / 2 - RADIUS * cy / HEIGHT)) {
            setCellIndex(ci, cj);
        } else {
            setCellIndex(ci - 1, cj + (ci % 2) - ((cy < HEIGHT / 2) ? 1 : 0));
        }
    }

*/

	self.fast_tile_at = function(e) {
		var marginY = self.padding;

		if ( e.clientY < self.padding + self._tile.height ) return null;
		if ( e.clientX < self.padding ) return null;

		var col = parseInt( e.clientX / ( self._tile.radius * 2 ) );

		return self.map[ 0 ][ col ];
	}
	self.tile_at = function( e ) {
		for ( var y=0; y < self.map.length; y++ ) {
			for ( var x=0; x < self.map[0].length; x++ ) {
				if ( ! self.map[y][x] ) continue;
				if ( self.map[y][x].contains( { 'x' : e.clientX, 'y' : e.clientY } ) )
					return self.map[y][x];
			}
		}
		return null;
	};

	self.add_hook = function( name, func ) {
		if ( ! self._hooks[name] )
			self._hooks[name] = [];
		self._hooks[name].push( func );
	};

	self.execute_hooks = function( name, obj ) {
		if ( self._hooks[name] ) {
			for ( i in self._hooks[name] ) {
				obj = self._hooks[name][i](obj);
			}
		}
		return obj;
	};

	self.add_layer = function(name, index) {
		if ( ! index ) index=self._layers.length;
		self._layers.splice(index, 0, { 'name' : name, 'obj' : new Kinetic.Layer() });
		return self._layers[index].obj;
	};

	self.get_layer_at = function(index) {
		if ( index > self._layers.length || index < 0 ) 
			return undefined;
		return self._layers[index].obj;
	};
	self.get_layer_position = function(name) {
		for ( var i in self._layers ) {
			if ( self._layers[i].name == name )
				return i;
		}
		return undefined;
	};
	self.get_layer = function(name) {
		for ( var i in self._layers ) {
			if ( self._layers[i].name == name )
				return self._layers[i].obj;
		}
		return undefined;
	};
	self.get_layers = function() {
		var o = [];
		for ( var l in self._layers ) {
			o.push(self._layers[l].obj);
		}
		return o;
	}
	self.reset_stage = function() {
		self.stage.clear();
		for ( var l in self._layers ) {
			self.stage.add( self._layers[l].obj );
		}
	};
	self.draw_layers = function() {
		for ( var l in self._layers ) {
			self._layers[l].obj.draw();
		}
	};	

	self.init = function() {

		// some precalcs for tile geometry
		self._tile.radius = args.radius || 0;	
		self._tile.sides = args.sides || 6;
	
		if ( self._tile.sides == 6 ) {
			self._tile.width = 2 * self._tile.radius;
			self._tile.length = Math.round( Math.sqrt(3) * self._tile.radius );
			self._tile.height = self._tile.radius;
	
		} else if ( self._tile.sides == 4 ) {
			self._tile.width  = 2 * self._tile.radius;
			self._tile.length = self._tile.width;
			self._tile.height = self._tile.width;
		}

		if ( self.is_3d ) {
			self._tile.height_3d = self.tile_height || self._tile.radius;
		}
	
		self.pixelheight = 0; 

		self.height_offset = 0;
		for ( var y in args.map ) {
			for ( var x in args.map[y] ) {
				h = args.map[y][x] - y;
				if ( self.height_offset < h ) 
					self.height_offset = h;
			}
		}
	
		if ( self.isometric ) {

			// pixelwidth is the width of the map, calculated from the first 
			// tile in the bottom row to the last tile of the top row.
			self.pixelwidth  = ( args.map[0].length * ( self._tile.length / 2 ) * 3 / 2 ) + 
							   ( args.map.length * self._tile.length/2 - self._tile.radius/2 );

			// pixelheight is the height of the map ( rows * height ) plus 
			// the "3d height" of a tile ( height_3d).  We add 2 * height_3d 
			// because we need to draw the sides of the bottom-most row, and we 
			// need space to draw something on top of the top-most row	
			self.pixelheight = ( ( args.map.length + self.height_offset ) * self._tile.height ) + 
							   ( self._tile.height / 2 + ( self._tile.height_3d * 2 ) );


		} else {
			self.pixelwidth = args.map[0].length * ( 3 * self._tile.radius / 2 );
			self.pixelheight = self._tile.radius + ( args.map.length - 1 ) * self._tile.width;
		}
	
		self.pixelwidth  += 2 * self.padding;
		self.pixelheight += 2 * self.padding;
 
		self.add_style( 'default',   { fillStyle : '#DDD' } );
		self.add_style( 'disabled',  { 
			fillStyle         : '#EEE', 
			strokeStyle       : '#DDD',
			side_fillStyle    : '#EEE',
			side_fillStyle2   : '#EEE',
			side_strokeStyle  : '#EEE',
		});
		self.add_style( 'hidden',    { 
			fillStyle         : 'transparent', 
			strokeStyle       : 'transparent', 
			side_fillStyle    : 'transparent',
			side_fillStyle2   : 'transparent',
			side_strokeStyle  : 'transparent',
			side_lineWidth    : 'transparent',
		});

		// set up the KineticJS stage
		self.stage  = new Kinetic.Stage( self.id, ( self.width || self.pixelwidth ), ( self.height || self.pixelheight ) );
	
		self.add_layer('background').listen(false);
		self.add_layer('3dtiles').listen(false);
		self.add_layer('tiles');
		self.add_layer('ui');

		self.get_layer_at(0).add( new Kinetic.Shape(function() {
			c = this.getContext();
			c.beginPath();
		   	c.fillStyle = "#444466";
			c.fillRect( 0, 0, self.pixelwidth, self.pixelheight );
			c.closePath();
		}) );


		for ( i in BoardPlugins ) {
			var plugin = BoardPlugins[i];
			self[ plugin.property ] = plugin.func(self);
		}

		// a two-dimensional array representing the configuration of tiles
		// on the board. The element at map[ y ][ x ] must be either a Tile 
		// object or null.
		self.map = [];
	
		// the dimensions of the board
		self.rows = 0;
		self.cols = 0;
	
		for ( var y=0; y < args.map.length; y++ ) {
			for ( var x=0; x < args.map[0].length; x++ ) {
	
				// initialize self row
				if ( ! self.map[y] ) {
					self.map[y] = []
				}
		
				// add a tile, or a null object, at self position
				if ( args.map[y][x] ) {
					self.add_tile( { x:x, y:y, z:args.map[y][x], null:false });
				} else {
					self.add_tile( { x:x, y:y, z:args.map[y][x], null:true });
				}
	
				// update the dimensions as we go
				if ( self.cols < x ) self.cols = x;
				if ( self.rows < y ) self.rows = y;
			}
		}
		return self;
	};
	
	return self;
};

//	Tile()
//		-- object definition for a single tile
//
function Tile( args ) {
	// the board object holding this tile
	this.parent = args.parent;

	// x and y and z are the array indices in the board's map for this tile
	this.x = args.x || 0;
	this.y = args.y || 0;
	this.z = args.z || 0;

	// hold the current style defintion for this tile
	this.style = args.style || 'default';
	this.last_style = 'default';

	// this.center contains the (x,y) coordinates of the center of the tile in 2D (screen) space.
	if ( this.parent._tile.sides == 6 ) {

		this.center = { 
			// distance between center points of adjacent tiles is 3/2 * radius, because 
			// alternating tiles are translated along the Y axis so the northeast/northwest 
			// faces align with their neighbours.
			x : this.x * this.parent._tile.radius * 3/2,
		
			// "length" is the long-side of the forshortened hexagon in 
			// isometric view, or the length of any side in top-down 2d.
			y : this.y * this.parent._tile.length,
		};

		// translate alternating tiles along the Y axis so the hex grid lines up.
		if ( this.x % 2 )
			this.center.y += this.parent._tile.radius * Math.sqrt(3) / 2;

	} else if ( this.parent._tile.sides == 4 ) {
		this.center = { 
			x : offset + this.parent._tile.radius + ( this.x * this.parent._tile.width  ),
			y : offset + this.parent._tile.radius + ( this.y * this.parent._tile.length ),
		};

	}
	this.set_style = function(name, no_redraw ) {
		this.last_style = this.style;
		this.style = name;
		this.parent.execute_hooks( 'tile_set_style_end', this );

		this.parent.get_layer('tiles').draw();
		this.parent.get_layer('3dtiles').draw();

		
	};

	this.vertices = function() {

		if ( this._coords )
			return this._coords;

		var self = this;
		var t = self.parent._tile;
		var r = t.radius;
		var p = new Object;
		var c = self.center;

		var point = function(x,y) {

			if ( self.parent.isometric == true ) {
				sin_a = Math.sin( Math.PI / 180 * 30 );
				cos_a = Math.cos( Math.PI / 180 * 30 );
	
				// rotate about the (2d, non-isometric) center of the tile
				this.x = t.length + x * cos_a - y * sin_a;
				this.y = t.length + x * sin_a + y * cos_a;
	
				// translate the x coordinate to the right one radius * this tile's row.
				this.x = this.x + ( ( self.parent.rows - 1 ) * t.length/2 );

				// translate the tiles to the same isometric plane
				if ( t.sides == 4 ) {
					this.y = this.y - ( ( self.x + self.y ) * t.radius );
				} else {
					this.y = this.y - ( ( (1.5 * self.x) + self.y ) * ( t.radius / 2 ) );
					if ( self.x % 2 ) {
						this.y -= t.height / 4;
					}
				}

			} else {
				this.x = x;
				this.y = y;
			}

			// add the canvas padding
			this.x += self.parent.padding;
			this.y += self.parent.padding;

			this.y += self.parent._tile.height_3d;

			// apply the height-field calculation.  self.z-1 means no
			// vertical offset for tiles of height=1.
			this.y -= self.z * self.parent._tile.height_3d + self.parent._tile.height / 4;

			var obj = self.parent.execute_hooks( 'get_screen_coords_end', this );
			return obj;
		}

		if ( t.sides == 6 ) {

			var p = [ 
				new point( c.x - ( r/2 ), c.y - t.length /2 ),  // nw
				new point( c.x + ( r/2 ), c.y - t.length /2 ),  // ne
				new point( c.x + r, c.y ),                      // e
				new point( c.x + ( r/2 ), c.y + t.length /2 ),  // se
				new point( c.x - ( r/2 ), c.y + t.length /2 ),  // sw
				new point( c.x - r, c.y ),                      // w
			];

			if ( this.parent.isometric ) {
				p[1].y = p[1].y - t.height / 2;
				p[2].y = p[2].y - t.height;
				p[3].y = p[3].y - t.height;
				p[4].y = p[4].y - t.height / 2;
			}

		} else {

			var p = [
				new point( c.x - t.width/2, c.y - t.width/2 ), // nw
				new point( c.x + t.width/2, c.y - t.width/2 ), // ne
				new point( c.x + t.width/2, c.y + t.width/2 ), // se
				new point( c.x - t.width/2, c.y + t.width/2 ), // sw
			];

			if ( this.parent.isometric ) {
				p[0].y = p[0].y + t.width/2;
				p[2].y = p[2].y - t.width/2;
			}
		}

		this._coords = p;
		return p; 
	};

	this.contains = function( p ) {
		// adapted from: http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

		var v = this.vertices();

		var hit=false;
		var i=0;
		var j=0;
		for ( i=0, j = v.length - 1; i < v.length; j = i++ ) {
			if ( ( ( v[i].y > p.y ) != ( v[j].y > p.y ) ) &&
			     ( p.x < ( v[j].x - v[i].x ) * ( p.y - v[i].y ) / ( v[j].y - v[i].y ) + v[i].x ) ) 
					hit = !hit;
		}
		return hit;
	};

	// return the array indices of this tile's neighbours.
	this.neighbours = function() {
		var b = this.parent;
		var n = []
		n = {
			'N'  : this.y > 0      ? b.map[ this.y - 1 ][ this.x ] : null,
			'S'  : this.y < b.rows ? b.map[ this.y + 1 ][ this.x ] : null,
			'NE' : null,
			'NW' : null,
			'SE' : null,
			'SW' : null,
		}

		var is_offset = this.x % 2;

		y = is_offset ? this.y : this.y - 1;
		x = this.x + 1;
		if ( y >= 0 && x < b.cols ) {
			n['NE'] = b.map[ y ][ x ];
		}

		y = is_offset ? this.y + 1 : this.y;
		x = this.x + 1;
		if ( x < b.cols && y < b.rows ) {
			n['SE'] = b.map[ y ][ x ];
		}

		y = is_offset ? this.y : this.y - 1;
		x = this.x - 1;
		if ( x >= 0 && y >= 0 ) {
			n['NW'] = b.map[ y ][ x ];
		}

		y = is_offset ? this.y + 1 : this.y;
		x = this.x - 1;
		if ( x >= 0 && y < b.rows ) {
			n['SW'] = b.map[ y ][ x ];
		}

		return n;
	};

	return this;	
}

