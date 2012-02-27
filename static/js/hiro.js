
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
		for ( var y=0; y < self.map.length; y++ ) {
			for ( var x=0; x < self.map[0].length; x++ ) {
				if ( self.map[y][x] ) {
					self.map[y][x].draw();
				}
			}
		}
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
	
		if ( self.isometric ) {

			// pixelwidth is the width of the map, calculated from the first 
			// tile in the bottom row to the last tile of the top row.
			self.pixelwidth  = args.map[0].length * ( self._tile.length / 2 ) * 3 / 2 + ( args.map.length * self._tile.length/2 - self._tile.radius/2 );

			// pixelheight is the height of the map ( rows * height ) plus 
			// the "3d height" of a tile ( height_3d).  We add 2 * height_3d 
			// because we need to draw the sides of the bottom-most row, and we 
			// need space to draw something on top of the top-most row	
			self.pixelheight = (  args.map.length * self._tile.height ) + self._tile.height / 2 + ( self._tile.height_3d * 2 );


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
			x : ( this.x ) * this.parent._tile.radius * 3/2,
		
			// The y coordinate is + 1 so that there's always room to draw something on 
			// the tile.  "length" is the long-side of the forshortened hexagon in 
			// isometric view, or the length of any side in top-down 2d.
			y : ( this.y ) * this.parent._tile.length,
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

	this.get_screen_coords = function() {

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

			p.nw = new point( c.x - ( r/2 ), c.y - t.length /2 );
			p.ne = new point( c.x + ( r/2 ), c.y - t.length /2 );
			p.e  = new point( c.x + r, c.y );
			p.se = new point( c.x + ( r/2 ), c.y + t.length /2 );
			p.sw = new point( c.x - ( r/2 ), c.y + t.length /2 );
			p.w  = new point( c.x - r, c.y );

			if ( this.parent.isometric ) {
				p.ne.y = p.ne.y - t.height / 2;
				p.e.y  = p.e.y  - t.height;
				p.se.y = p.se.y - t.height;
				p.sw.y = p.sw.y - t.height / 2;
			}

		} else {

			p.nw = new point( c.x - t.width/2, c.y - t.width/2 );
			p.ne = new point( c.x + t.width/2, c.y - t.width/2 );
			p.se = new point( c.x + t.width/2, c.y + t.width/2 );
			p.sw = new point( c.x - t.width/2, c.y + t.width/2 );

			if ( this.parent.isometric ) {
				p.nw.y = p.nw.y + t.width/2;
				p.se.y = p.se.y - t.width/2;
			}

		}
		return p;
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

	// (re)draw this tile
	this.draw = function( args ) {
		if ( ! args ) {
			args = {}
		}
		var b = this.parent;
		var self = this;

		self = b.execute_hooks( 'new_tile_start', self );

		self.surface = new Kinetic.Shape( function() {
			var style = self.parent._style[ self.style ];
			var c = this.getContext();
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
			var p = self.get_screen_coords();

			if ( b._tile.sides == 6 ) {
				c.moveTo( p.w.x,  p.w.y  );
				c.lineTo( p.nw.x, p.nw.y ); 
				c.lineTo( p.ne.x, p.ne.y ); 
				c.lineTo( p.e.x,  p.e.y  ); 
				c.lineTo( p.se.x, p.se.y ); 
				c.lineTo( p.sw.x, p.sw.y  ); 
			} else {
				c.moveTo( p.nw.x, p.nw.y  );
				c.lineTo( p.ne.x, p.ne.y ); 
				c.lineTo( p.se.x, p.se.y ); 
				c.lineTo( p.sw.x, p.sw.y ); 
				c.lineTo( p.nw.x, p.nw.y ); 
			}

			c.closePath();
			c.stroke();
			c.fill();

			
			b.execute_hooks( 'tile_draw_surface_end', { 
				'context' : c, 
				'point'   : p, 
				'tile'    : self 
			});

		});

		self.surface.on("mouseover", function() {
			if ( self.style != 'hidden' && self.style != 'disabled' )
				self.set_style('highlight');
		});
		self.surface.on("mouseout", function() {
			if ( self.style != 'hidden' && self.style != 'disabled' )
				self.set_style( self.last_style );
		});
		self.surface.on("click tap", function() {
			if ( self.style != 'hidden' && self.style != 'disabled' )
				self.set_style('hidden');
		});

		b.get_layer('tiles').add( self.surface );

		if ( b.is_3d ) {
			self.shape3d = new Kinetic.Shape( function() {
				var style = self.parent._style[ self.style ];
				var c = this.getContext();
				c.beginPath();

				// apply the current style for this tile
				c.fillStyle     = style.side_fillStyle;
				c.strokeStyle   = style.side_strokeStyle;
				c.lineWidth     = style.side_lineWidth;
				c.globalAlpha   = style.side_globalAlpha;

				h = self.z * b._tile.height_3d;

				var p = self.get_screen_coords();
				c.beginPath();
				c.moveTo( p.w.x, p.w.y );
				c.lineTo( p.w.x, p.w.y + h );
				c.lineTo( p.sw.x, p.sw.y + h );
				c.lineTo( p.sw.x, p.sw.y );
				c.lineTo( p.w.x, p.w.y );
				c.stroke();
				c.fill()
	
				c.beginPath();
				c.moveTo( p.e.x, p.e.y );
				c.lineTo( p.e.x, p.e.y + h );
				c.lineTo( p.se.x, p.se.y + h );
				c.lineTo( p.se.x, p.se.y );
				c.lineTo( p.e.x, p.e.y );
				c.stroke();
				c.fill()
	
				c.fillStyle = style.side_fillStyle2;
				c.beginPath();
				c.moveTo( p.sw.x, p.sw.y );
				c.lineTo( p.sw.x, p.sw.y + h );
				c.lineTo( p.se.x, p.se.y + h );
				c.lineTo( p.se.x, p.se.y );
				c.lineTo( p.sw.x, p.sw.y );
				c.stroke();
				c.fill();
			});
			b.get_layer('3dtiles').add( self.shape3d );
			b.get_layer('3dtiles').draw();
		}

		b.execute_hooks( 'tile_draw_end', self );
		b.get_layer('tiles').draw();

	}

	return this;	
}

