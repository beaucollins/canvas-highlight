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
import reduce from 'lodash/reduce';
import _map from 'lodash/map';
import get from 'lodash/get';

const when = ( condition, fn ) => ( ... args ) => condition( ... args ) ? fn( ... args ) : args[0]
const map = ( ... fns ) => ( ... args ) => _map( fns, ( fn ) => fn( ... args ) );
const propEquals = ( key, value ) => ( i ) => get( i, key ) === value
const flowRight = ( ... fns ) => ( ... args ) => {
	const [head, ... rest] = fns;
	return reduce( rest, ( result, fn ) => fn( result ), head( ... args ) )
}
const { devicePixelRatio: ratio } = window;
const scale = 1 / ratio;

const canvas = document.createElement( 'canvas' );
const context = canvas.getContext( '2d' );
const div = document.createElement( 'div' );

document.body.style.margin = 0;

const applyStyle = ( node, style ) => forEach( style, ( value, prop ) => node.style[prop] = value )

applyStyle( div, { position: 'absolute', width: '100%', height: '100%' } )

document.body.appendChild( div );
div.appendChild( canvas );

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let image = new Image();

const drawImage = ( ctx, img ) => {
	// before drawing image apply device pixel ratio resize
	ctx.transform( scale, 0, 0, scale, 0, 0 );
	ctx.drawImage( img, 0, 0 );
	ctx.resetTransform();
}

const clearContext = ctx => ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height );
const highlightRects = ( ctx, rects = [] ) => {
	// create a canvas for drawing the rects
	if ( rects.length === 0 ) {
		return;
	}
	const { canvas: { width, height } } = ctx;
	const rectCanvas = document.createElement( 'canvas' );
	rectCanvas.width = width;
	rectCanvas.height = height;
	const rectContext = rectCanvas.getContext( '2d' );
	rectContext.fillStyle = 'black';
	rectContext.globalAlpha = 0.25;
	rectContext.fillRect( 0, 0, width, height );
	rectContext.globalAlpha = 0.8;

	rectContext.strokeStyle = '#f00';
	rectContext.lineWidth = 2;
	forEach( rects, ( [ { x, y }, { x: dx, y: dy } ] ) => {
		const w = dx - x, h = dy - y;
		rectContext.clearRect( x, y, w, h );
		rectContext.strokeRect( x, y, w, h );
	} );
	ctx.drawImage( rectContext.canvas, 0, 0 );
}

// copy paste
document.addEventListener( 'paste', e => {
	const { clipboardData: { items } } = e;
	if ( ! items || items.length === 0 ) {
		console.log( 'no items', e, e.originalEvent );
		debugger;
		return;
	}

	context.clearRect( 0, 0, canvas.width, canvas.height );
	const [ item ] = items;
	const blob = item.getAsFile();
	const reader = new FileReader();
	image.onload = () => {
		drawImage( context, image );
	}
	reader.onload = ( { target: { result } } ) => image.src = result;
	reader.readAsDataURL( blob );
} );

let pressed = false;
const isPressed = () => pressed === true;

const setPressed = () => pressed = true;
const clearPressed = () => pressed = false;
const whenBackspace = fn => when( propEquals( 'which', 8 ), fn );

let topLeft = null, bottomRight = null;

const asCoords = ( { clientX: x, clientY: y } ) => ( { x, y } );
canvas.addEventListener( 'mousedown', map( setPressed, flowRight( asCoords, coords => topLeft = coords ) ) );
canvas.addEventListener( 'mouseup', map( clearPressed, flowRight( asCoords, coords => bottomRight = coords ) ) );
canvas.addEventListener( 'mousemove', when( isPressed, flowRight( asCoords, coords => {
	clearContext( context );
	drawImage( context, image );
	highlightRects( context, [ [topLeft, coords] ] );
	// context.strokeStyle = 'red';
	// context.lineWidth = 2;
	// context.strokeRect.apply( context, [ a.x, a.y, c.x - a.x, c.y - a.y ] );
	// context.clearRect
} ) ) );

document.addEventListener( 'keydown', whenBackspace( () => {
	clearContext( context );
	drawImage( context, image );
	highlightRects( context );
} ) )

// drag 'n drop
