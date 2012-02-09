// the 'viewport' is the visible area of the entire game board. We create a stage
// of this size, and adjust the x/y offset of what we draw according to the the 
// viewport origin.
BoardPlugins.push( { 'property' : 'viewport', 'func' : function(board) {
	var self = this;

	self.x              = 0;
	self.y              = 0;
	self.width          = board.width  || board.pixelwidth;
	self.height         = board.height || board.pixelheight;
	self.stepsize       = 10;
	self.interval       = 25;
	self.hotspot_size   = 20;
	self._panning       = undefined;

	var north = new Kinetic.Shape( function() {
		c = this.getContext();
		c.beginPath();
		c.fillStyle='red';
		c.globalAlpha = 0.3;
		c.fillRect( 0, 0, self.width, self.hotspot_size );
		c.closePath();
	});
	north.on( "mousemove.viewport", function() { self.pan({ 'dir' : ['north'] }) });
	north.on( "mouseout.viewport",  self.stop_panning );
	board.layers['ui'].add( north );

	var south = new Kinetic.Shape( function() {
		c = this.getContext();
		c.beginPath();
		c.fillStyle='red';
		c.globalAlpha = 0.3;
		c.fillRect( 0, self.height - self.hotspot_size, self.width, self.height );
		c.closePath();
	});
	south.on( "mousemove.viewport", function() { self.pan({ 'dir' : ['south'] }) });
	south.on( "mouseout.viewport",  self.stop_panning );
	board.layers['ui'].add( south );

	var east = new Kinetic.Shape( function() {
		c = this.getContext();
		c.beginPath();
		c.fillStyle='red';
		c.globalAlpha = 0.3;
		c.fillRect( 0, 0, self.hotspot_size, self.height );
		c.closePath();
	});
	east.on( "mousemove.viewport", function() { self.pan({ 'dir' : ['east'] }) });
	east.on( "mouseout.viewport",  self.stop_panning );
	board.layers['ui'].add( east );

	var west = new Kinetic.Shape( function() {
		c = this.getContext();
		c.beginPath();
		c.fillStyle='red';
		c.globalAlpha = 0.3;
		c.fillRect( self.width - self.hotspot_size, 0, self.width, self.height );
		c.closePath();
	});
	west.on( "mousemove.viewport", function() { self.pan({ 'dir' : ['west'] }) });
	west.on( "mouseout.viewport",  self.stop_panning );
	board.layers['ui'].add( west );

	board.stage.on( "mouseout.viewport", self.stop_panning );

	// object is the point containing x/y coords of the center of the tile in screenspace
	board.add_hook( 'get_screen_coords_end', function(obj) {
		obj.x = obj.x - board.viewport.x;
		obj.y = obj.y - board.viewport.y;
	});
	
	self.pan = function( args ) {
 		var pos = board.stage.getMousePosition();
		if ( ! pos )
			return;

		var offset_x = 0;
		var offset_y = 0;

		var stepsize = args.stepsize || self.stepsize;

		for ( var d in args.dir ) {
			switch( args.dir[d] ) {
				case 'west':
					offset_x = stepsize;
					break;
				case 'east':
					offset_x = -1 * stepsize;
					break;
				case 'north':
					offset_y = -1 * stepsize;
					break;
				case 'south':
					offset_y = stepsize;
					break;
				default:
					return;
			}
		}
		self.offset = { 'x' : offset_x, 'y' : offset_y };
		if ( offset_x || offset_y ) {
			if ( ! self._panning ) {
				board.layers['tiles'].listen(false);
				self._panning = window.setInterval( self.do_panning, self.interval );
			}
		} else {
			self.stop_panning();
		}
	};

	self.do_panning = function() {
		var v = self;
		if ( ! v.offset ) return;

		if ( v.offset.x > 0 ) {
			if ( ( v.x + v.width ) + v.offset.x > board.pixelwidth ) {
				v.offset.x = board.pixelwidth - ( v.x + v.width );
			}
		}

		if ( v.offset.x < 0 ) {
			if ( v.x + v.offset.x < 0 ) {
				v.offset.x = -1 * v.x;
			}
		}

		if ( v.offset.y > 0 ) {
			if ( v.offset.y + v.y + v.height > board.pixelheight ) {
				v.offset.y = board.pixelheight - ( v.y + v.height );
			}
		}

		if ( v.offset.y < 0 ) {
			if ( v.y + v.offset.y < 0 ) {
				v.offset.y = -1 * v.y;
			}
		}

		if ( v.offset.x == 0 && v.offset.y == 0 ) {
			self.stop_panning();
		} else {
			self.x += v.offset.x;
			self.y += v.offset.y;
	
			for ( var l in board.layers ) {
				board.layers[l].draw();
			}
		}
	};

	self.stop_panning = function() {
		self.offset=undefined;
		if ( self._panning ) {
			window.clearInterval( self._panning );
			self._panning=undefined;
		}
		board.layers['tiles'].listen(true);
	};

	board.layers['ui'].draw();
	return self;
}});
