import LFPy
from neuron import h
import numpy as np

cell = LFPy.Cell(morphology = 'morphologies/L5_Mainen96_LFPy.hoc')

synapse = LFPy.Synapse(cell, 
                       idx = cell.get_idx("soma[0]"),
                       syntype = 'Exp2Syn', 
                       weight = 0.005, 
                       e = 0, 
                       tau1 = 0.5,
                       tau2 = 2,
                       record_current = True)
# synapse.set_spike_times(array([20., 40]))

# cell.simulate(rec_isyn=True)

arrayLength = 0;
for sec in h.allsec():
    arrayLength += h.n3d();
    arrayLength += 1;


morphArr = np.zeros([arrayLength, 4]);

indx = 0;
for sec in h.allsec():
    for i in xrange(int(h.n3d())):
        morphArr[indx,0] = h.x3d(i);
        morphArr[indx,1] = h.y3d(i);
        morphArr[indx,2] = h.z3d(i);
        morphArr[indx,3] = h.diam3d(i);
        indx += 1;
    indx += 1;

np.savetxt("web/morph.csv", morphArr, delimiter=',')


