// the 'viewport' is the visible area of the entire game board. We create a stage
// of this size, and adjust the x/y offset of what we draw according to the the 
// viewport origin.
BoardPlugins.push( { 'property' : 'viewport', 'func' : function(board) {
	var self = this;

	// If the board was not created with specific dimensions, it will 
	// be sized automatically according to the map, meaning 100% of 
	// the map will always be visible -- thus no viewport is needed.
	//
	if ( board.width == undefined && board.height == undefined ) 
		return self;

	self.x              = 0;
	self.y              = 0;
	self.width          = board.width  || board.pixelwidth;
	self.height         = board.height || board.pixelheight;
	self.stepsize       = 30;
	self.interval       = 25;
	self.hotspot_size   = 20;
	self._panning       = undefined;

	var ui = board.get_layer('ui');

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
	ui.add(north);

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
	ui.add( south );

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
	ui.add( east );

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
	ui.add( west );

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
				board.get_layer('tiles').listen(false);
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
	
			l = board.get_layers();	
			for ( var i in l ) {
				l[i].draw();
			}
		}
	};

	self.stop_panning = function() {
		self.offset=undefined;
		if ( self._panning ) {
			window.clearInterval( self._panning );
			self._panning=undefined;
		}
		board.get_layer('tiles').listen(true);
	};

	board.get_layer('ui').listen(true);
	return self;
}});
