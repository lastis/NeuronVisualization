import LFPy
from pylab import *
from skimage import measure
from meshgen import *

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

nx = 10
ny = 10
nz = 10
x = np.linspace(-200,200,nx)
y = np.linspace(-200,200,ny)
z = np.linspace(-400,1200,nz)

electrodeParameters = getElectrodeParameters(x,y,z)

cell = LFPy.Cell(**cellParameters)
cell.set_pos(xpos=-10, ypos=0, zpos=0)
cell.set_rotation(z=np.pi)

synapse = LFPy.Synapse(cell,
                       idx = cell.get_closest_idx(z=800),
                       **synapseParameters)
synapse.set_spike_times(array([10, 30, 50]))
                        
electrode = LFPy.RecExtElectrode(**electrodeParameters)

cell.simulate(electrode = electrode, rec_isyn=True)

# figure(figsize=(12, 6))
# subplot(133)
# pcolormesh(cell.tvec, electrode.z, electrode.LFP,
#            vmin=-abs(electrode.LFP).max(), vmax=abs(electrode.LFP).max(),
#            cmap='spectral_r'), colorbar(), title('LFP (mV)')
# subplot(232)
# plot(cell.tvec, synapse.i), title('synaptic current (pA)')
# subplot(235)
# plot(cell.tvec, cell.somav), title('somatic voltage (mV)')
# subplot(131)
# for sec in LFPy.cell.neuron.h.allsec():
#     idx = cell.get_idx(sec.name())
#     plot(np.r_[cell.xstart[idx], cell.xend[idx][-1]],
#             np.r_[cell.zstart[idx], cell.zend[idx][-1]],
#             color='k')
# plot([cell.synapses[0].x], [cell.synapses[0].z], \
#      color=cell.synapses[0].color, marker=cell.synapses[0].marker, markersize=10)
# plot(electrode.x, electrode.z, '.', marker='o', color='g')
# axis([-500, 500, -400, 1200])
# show()

print "LFP Shape:"
print electrode.LFP.shape


writeContoursToJson(electrode.LFP,x,y,z,file_prefix='potential', \
    directory='web/contour')
# verts, faces = getContour(electrode.LFP,x,y,z)
# meshToJson(verts,faces);







