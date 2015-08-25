import numpy as np
import json
import os
from skimage import measure


def writeContoursToJson(LFP,x,y,z,file_prefix='potential',directory='contours'):

    dx = np.abs(x[1]-x[0])
    dy = np.abs(y[1]-y[0])
    dz = np.abs(z[1]-z[0])

    nx = len(x)
    ny = len(y)
    nz = len(z)

    frames = LFP.shape[1]

    filenames = [];
    for i in xrange(frames):
        U = LFP[:,i].reshape(nx,ny,nz)
        UHalf = U.max()/2;
        idx = (np.abs(U-UHalf)).argmin()
        UHalf = U.flatten()[idx]
        if UHalf == 0 :
            continue
        verts, faces = measure.marching_cubes(U,UHalf,spacing=(dx,dy,dz))
        verts[:,0] = verts[:,0] + x[0]
        verts[:,1] = verts[:,1] + y[0]
        verts[:,2] = verts[:,2] + z[0]
        filename = file_prefix+str(i)+'.js'
        filenames.append(filename)
        meshToJson(verts,faces,filename,directory)

    data = {'filenames' : filenames}
    dataString = json.dumps(data)
    f = open(directory+'/config.js','w')
    f.write(dataString)
    f.close()



def getContour(LFP, x, y, z) :
    dx = np.abs(x[1]-x[0])
    dy = np.abs(y[1]-y[0])
    dz = np.abs(z[1]-z[0])

    nx = len(x)
    ny = len(y)
    nz = len(z)

    U = np.max(np.abs(LFP),1).reshape((nx,ny,nz))
    UHalf = U.max()/2
    idx = (np.abs(U-UHalf)).argmin()
    UHalf = U.flatten()[idx]
    print "U Shape: ",  U.shape
    print "Half value: ", UHalf
    print "Index : ", idx

    verts, faces = measure.marching_cubes(U,UHalf,spacing=(dx,dy,dz))
    verts[:,0] = verts[:,0] + x[0]
    verts[:,1] = verts[:,1] + y[0]
    verts[:,2] = verts[:,2] + z[0]
    return verts, faces

def meshToJson(verts,faces,filename='potential',directory='contours') :
    if not os.path.exists(directory):
        os.makedirs(directory)
    filename, ext = os.path.splitext(filename)
    filename = filename + '.js'
    filename = directory + '/' + filename
    N = faces.shape[0]
    facesFormatted = np.zeros((N,4))
    facesFormatted[:,1:] = faces

    data = { \
        'metadata' : \
            {\
            'formatVersion' : 3\
            },\
        'vertices': verts.flatten().tolist(), \
        'faces': facesFormatted.astype(int).flatten().tolist()\
    }
    dataString = json.dumps(data)
    f = open(filename,'w')
    f.write(dataString)
    f.close()



def getElectrodeParameters(x,y,z,sigma=0.3):
    X,Y,Z = np.meshgrid(x,y,z)
    # Define electrode parameters
    grid_electrode_parameters = {
        'sigma' : sigma,      # extracellular conductivity
        'x' : X.flatten(),  # electrode requires 1d vector of positions
        'y' : Y.flatten(),
        'z' : Z.flatten()
    }
    return grid_electrode_parameters
    

