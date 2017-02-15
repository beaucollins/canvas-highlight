// 1. Sources for image
// 	- a. clipboard api
// 	- b. drag-n-drop api
// 	- c. file-field api
//
// 2. Render image in Canvas
// 	- a. allow for drawing
//
// # Book marklet -- prefilx the URL? -- nice-to-have
import forEach from 'lodash/forEach';
import map from 'lodash/map';
import get from 'lodash/get';
import filter from 'lodash/filter';
import assign from 'lodash/assign';
import every from 'lodash/every';
import reverse from 'lodash/reverse';
import find from 'lodash/find';
import slice from 'lodash/slice';
import flow from 'lodash/flow'
import pure from 'lodash/identity';

const when = ( condition, fn, fail = pure ) => ( ... args ) => condition( ... args ) ? fn( ... args ) : fail( ... args )
const map_fn = ( ... fns ) => ( ... args ) => map( fns, ( fn ) => fn( ... args ) );
const propEquals = ( key, value ) => ( i ) => get( i, key ) === value
const and = ( ... fns ) => ( ... args ) => every( fns, fn => fn( ... args ) )

const { devicePixelRatio: ratio } = window;
const scale = 1 / ratio;
let rects = [];

const drawImage = ( ctx, img ) => {
	// before drawing image apply device pixel ratio resize
	if ( !img ) {
		return;
	}
	ctx.canvas.width = img.width * scale;
	ctx.canvas.height = img.height * scale;
	ctx.setTransform( scale, 0, 0, scale, 0, 0 );
	ctx.drawImage( img, 0, 0 );
	ctx.setTransform( 1, 0, 0, 1, 0, 0 );
}

const STATES = {
	MOVING: 'moving',
	RESIZING: 'resizing',
	RESTING: 'resting',
	SELECTING: 'selecting'
};

let current_state;

const stateIs = state => () => current_state === state;
const setState = state => v => ( current_state = state, v );
const isMoving = stateIs( STATES.MOVING );
const isResizing = stateIs( STATES.RESIZING );
const isSelecting = stateIs( STATES.SELECTING );

const keyIsPressed = key => propEquals( 'which', key );
const whenEscape = fn => when( propEquals( 'which', 27 ), fn );

const asMovement = ( { movementX, movementY } ) => ( { dx: movementX, dy: movementY } );

const inRect = ( { x, y }, [ topLeft, bottomRight ] ) => (
	x >= topLeft.x && x <= bottomRight.x && y >= topLeft.y && y <= bottomRight.y
);

const rectForCoords = coords => find( reverse( slice( rects ) ), rect => inRect( coords, rect ) );
const pointsEqual = ( a, b ) => a.x === b.x && a.y === b.y
const rectsEqual = ( a, b ) => pointsEqual( a[0], b[0] ) && pointsEqual( a[1], b[1] )

const newRect = coords => [ coords, coords ];
const filterRect = rect => {
	rects = filter( rects, existing => ! rectsEqual( rect, existing ) )
	return rect;
}
const addToFront = rect => {
	rects.push( rect )
	return rect;
}

const resizeTopRect = coords => {
	const [ rect ] = rects.slice( -1 )
	rects.splice( -1, 1, [ rect[0], coords ] )
	return rects;
}

const movePoint = ( { x, y }, { dx, dy } ) => ( { x: x + dx, y: y + dy } );

const moveRect = ( rect, delta ) => map( rect, point => movePoint( point, delta ) );

const moveTopRect = delta => {
	const [ rect ] = rects.slice( -1 )
	rects.splice( -1, 1, moveRect( rect, delta ) );
	return rects;
}

const deleteSelectedRect = () => {
	rects = rects.slice( 0, -1 );
}

const absoluteCoords = ( [ topLeft, bottomRight ] ) => {
	let [ a, b ] = [ assign( {}, topLeft ), assign( {}, bottomRight ) ];
	if ( bottomRight.x < topLeft.x ) {
		let x = topLeft.x
		a.x = b.x;
		b.x = x;
	}

	if ( bottomRight.y < topLeft.y ) {
		let y = topLeft.y;
		a.y = b.y;
		b.y = y;
	}
	return [a, b];
}

const getWidth = ( [ { x: x1 }, { x: x2 } ] ) => Math.abs( x2 - x1 )
const getHeight = ( [ { y: y1 }, { y: y2 } ] ) => Math.abs( y2 - y1 )

const isBigEnough = ( rect ) => getWidth( rect ) > 10 || getHeight( rect ) > 10;

const cleanupRects = () => rects = map( filter( rects, isBigEnough ), absoluteCoords )

const clearContext = ctx => {
	console.log( 'clear context' );
	ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height );
}

const highlightRects = ( ctx, highlights = [] ) => {
	// create a canvas for drawing the rects
	if ( highlights.length === 0 ) {
		return;
	}
	const rectCanvas = document.createElement( 'canvas' );
	const { canvas: { width, height } } = ctx;
	rectCanvas.width = width;
	rectCanvas.height = height;
	const rectContext = rectCanvas.getContext( '2d' );
	rectContext.fillStyle = 'black';
	rectContext.globalAlpha = 0.25;
	rectContext.fillRect( 0, 0, width, height );
	rectContext.globalAlpha = 0.5;

	const selecting = isSelecting();
	const resizing = isResizing();
	const moving = isMoving();

	forEach( highlights, ( [ { x, y }, { x: dx, y: dy } ], i ) => {
		const w = dx - x, h = dy - y;
		const isLast = i === highlights.length - 1
		rectContext.setLineDash( [ 0 ] );
		rectContext.strokeStyle = '#f00';
		rectContext.lineWidth = 2;
		rectContext.globalAlpha = 0.5;

		if ( isLast && ( selecting || moving ) ) {
			rectContext.strokeStyle = '#f00';
			rectContext.globalAlpha = 1;
		} else if ( isLast && resizing ) {
			rectContext.globalAlpha = 1;
			rectContext.setLineDash( [ 1, 1 ] );
			rectContext.strokeStyle = '#000';
			rectContext.lineWidth = 1;
		}

		rectContext.clearRect( x, y, w, h );
		rectContext.strokeRect( x, y, w, h );
	} );
	ctx.drawImage( rectContext.canvas, 0, 0 );
}

setState( STATES.RESTING );

const offsetCoords = node => ( { x, y } ) => {
	const { left, top } = node.getBoundingClientRect();
	return { x: x - left, y: y - top };
};

const init = () => {
	const canvas = document.createElement( 'canvas' );
	const context = canvas.getContext( '2d' );
	let image;

	const draw = () => {
		clearContext( context );
		drawImage( context, image );
		highlightRects( context, rects );
	}

	const asCoords = flow(
		( { clientX: x, clientY: y } ) => ( { x, y } ),
		offsetCoords( canvas )
	);

	document.addEventListener( 'keydown', map_fn(
		when(
			and( keyIsPressed( 8 ), stateIs( STATES.SELECTING ) ),
			map_fn( e => e.preventDefault(), deleteSelectedRect, setState( STATES.RESTING ), draw )
		),
		whenEscape( map_fn( setState( STATES.RESTING ), draw ) )
	) );

	canvas.addEventListener( 'mousedown', flow( asCoords, when(
		rectForCoords,
		flow( rectForCoords, filterRect, setState( STATES.MOVING ) ),
		flow( newRect, setState( STATES.RESIZING ) )
	), addToFront, draw ) );

	canvas.addEventListener( 'mouseup', map_fn(
		cleanupRects,
		when( flow( asCoords, rectForCoords ), setState( STATES.SELECTING ), setState( STATES.RESTING ) ),
		draw
	) );

	canvas.addEventListener( 'mousemove', map_fn(
		when( isMoving, flow( asMovement, moveTopRect, draw ) ),
		when( isResizing, flow( asCoords, resizeTopRect, draw ) )
	) );

	return {
		canvas,
		write: img => new Promise( resolve => {
			rects = [];
			image = img;
			draw()
			resolve();
		} ),
		read: () => new Promise( resolve => {
			canvas.toBlob( resolve )
		} )
	}
}

if ( window ) {
	window.screenshot = init;
}

if (!HTMLCanvasElement.prototype.toBlob) {
 Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
  value: function (callback, type, quality) {

    var binStr = atob( this.toDataURL(type, quality).split(',')[1] ),
        len = binStr.length,
        arr = new Uint8Array(len);

    for (var i=0; i<len; i++ ) {
     arr[i] = binStr.charCodeAt(i);
    }

    callback( new Blob( [arr], {type: type || 'image/png'} ) );
  }
 });
}

export default init;
