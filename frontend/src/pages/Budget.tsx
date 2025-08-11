const Budget = () => {
  return (
    <main className="container mx-auto py-10">
      <h1 className="text-3xl font-bold text-[#D3D3FF]">Trip Budget</h1>
      <section className="mt-6 grid md:grid-cols-2 gap-6">
        <div className="rounded-lg border p-4 bg-[#D3D3FF] text-black">Cost breakdown</div>
        <div className="rounded-lg border p-4 bg-[#D3D3FF] text-black">Charts</div>
      </section>
    </main>
  );
};
export default Budget;
