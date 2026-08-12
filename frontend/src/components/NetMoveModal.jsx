export default function NetMoveModal({ metrics, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold mb-5">Net Movement Breakdown</h2>
        <div className="space-y-3">
          <div className="flex justify-between"><span>Purchases (+)</span><b>{metrics.purchases}</b></div>
          <div className="flex justify-between"><span>Transfers In (+)</span><b>{metrics.transfersIn}</b></div>
          <div className="flex justify-between"><span>Transfers Out (-)</span><b>{metrics.transfersOut}</b></div>
          <hr />
          <div className="flex justify-between font-bold"><span>Total Net</span><b>{metrics.netMovement}</b></div>
        </div>
        <button onClick={onClose} className="mt-6 w-full rounded-lg bg-slate-900 text-white py-2 hover:bg-slate-800">
          Close
        </button>
      </div>
    </div>
  );
}
