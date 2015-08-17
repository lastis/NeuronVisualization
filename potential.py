import LFPy
from pylab import *
from skimage import measure

cellParameters = {
    'morphology' : 'morphologies/L5_Mainen96_LFPy.hoc',
    'timeres_NEURON' : 1,
    'timeres_python' : 1,
    'tstartms' : -50,
    'tstopms' : 100,
}

synapseParameters = {
    'syntype' : 'Exp2Syn',
    'e' : 0.,
    'tau1' : 0.5,
    'tau2' : 2.0,
    'weight' : 0.005,
    'record_current' : True,
}

Z = np.arange(-400,1201,200)
X = np.arange(-200,201,100)
Y = np.arange(-200,201,100)

z = zeros(Z.size*Y.size*X.size)
y = zeros(Z.size*Y.size*X.size)
x = zeros(Z.size*Y.size*X.size)

cnt = 0
for i in xrange(Z.size) :
    for j in xrange(Y.size) :
        for k in xrange(X.size) :
            x[cnt] = X[k]
            y[cnt] = Y[j]
            z[cnt] = Z[i]
            cnt += 1

# z = Z
# x = zeros(Z.size)
# y = zeros(Z.size)


electrodeParameters = {
    'x' : x,
    'y' : y,
    'z' : z,
    'sigma' : 0.3,
}

cell = LFPy.Cell(**cellParameters)
cell.set_pos(xpos=-10, ypos=0, zpos=0)
cell.set_rotation(z=np.pi)

synapse = LFPy.Synapse(cell,
                       idx = cell.get_closest_idx(z=800),
                       **synapseParameters)
synapse.set_spike_times(array([10, 30, 50]))
                        
electrode = LFPy.RecExtElectrode(**electrodeParameters)

cell.simulate(electrode = electrode, rec_isyn=True)

figure(figsize=(12, 6))
subplot(133)
pcolormesh(cell.tvec, electrode.z, electrode.LFP,
           vmin=-abs(electrode.LFP).max(), vmax=abs(electrode.LFP).max(),
           cmap='spectral_r'), colorbar(), title('LFP (mV)')
subplot(232)
plot(cell.tvec, synapse.i), title('synaptic current (pA)')
subplot(235)
plot(cell.tvec, cell.somav), title('somatic voltage (mV)')
subplot(131)
for sec in LFPy.cell.neuron.h.allsec():
    idx = cell.get_idx(sec.name())
    plot(np.r_[cell.xstart[idx], cell.xend[idx][-1]],
            np.r_[cell.zstart[idx], cell.zend[idx][-1]],
            color='k')
plot([cell.synapses[0].x], [cell.synapses[0].z], \
     color=cell.synapses[0].color, marker=cell.synapses[0].marker, markersize=10)
plot(electrode.x, electrode.z, '.', marker='o', color='g')
axis([-500, 500, -400, 1200])

print electrode.z.size
print electrode.LFP.shape

grid = zeros([X.size,Y.size,Z.size]);
cnt = 0
for i in xrange(Z.size) :
    for j in xrange(Y.size) :
        for k in xrange(X.size) :
            if electrode.LFP[cnt,11] == 0.0 : 
                cnt += 1
                continue
            print elextrode.LFP[cnt,11]
            grid[i,j,k] = 1
            cnt += 1

# verts, faces = measure.marching_cubes(grid, 1)
# print verts

# np.savetxt("web/potentials.csv", electrode.LFP, delimiter=',')

#savefig('LFPy-example-2.pdf', dpi=300)

show()
