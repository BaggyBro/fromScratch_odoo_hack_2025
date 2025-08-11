const CitySearch = () => {
  return (
    <main className="container mx-auto py-10">
      <h1 className="text-3xl font-bold">City Search</h1>
      <section className="mt-6 grid md:grid-cols-3 gap-6">
        <aside className="rounded-lg border p-4 bg-card">Filters</aside>
        <div className="rounded-lg border p-4 bg-card md:col-span-2">Results</div>
      </section>
    </main>
  );
};
export default CitySearch;
