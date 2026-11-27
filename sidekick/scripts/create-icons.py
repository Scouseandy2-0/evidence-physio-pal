"""Rasterise the existing S-plus app mark for Home Screen icons (Pillow)."""
from pathlib import Path
from PIL import Image, ImageDraw

def curve(a,b,c,d):
    return [tuple((1-t)**3*a[i]+3*(1-t)**2*t*b[i]+3*(1-t)*t*t*c[i]+t**3*d[i] for i in (0,1)) for t in [n/80 for n in range(81)]]
for size in (180,192,512):
    scale=size*4/128
    image=Image.new('RGB',(size*4,size*4),'#123c67'); draw=ImageDraw.Draw(image)
    def line(points,width):
        points=[(round(x*scale),round(y*scale)) for x,y in points]
        draw.line(points,fill='#c4e2ff',width=round(width*scale),joint='curve')
        radius=width*scale/2
        for x,y in (points[0],points[-1]): draw.ellipse((x-radius,y-radius,x+radius,y+radius),fill='#c4e2ff')
    line([(79,38),(53,38)]+curve((53,38),(34,38),(34,62),(53,62))+[(64,62)]+curve((64,62),(83,62),(83,87),(64,87))+[(38,87)],12)
    line([(96,15),(96,39)],7); line([(84,27),(108,27)],7)
    path=Path('web')/f'icon-{size}.png'
    image.resize((size,size),Image.Resampling.LANCZOS).save(path,optimize=True)
print('Created opaque Home Screen icons from the existing S-plus mark.')
