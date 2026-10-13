// Ditampilkan selama sesi masih dicek ke server (token undefined)
export default function PageLoading() {
  return (
    <div role="status" className="flex min-h-dvh items-center justify-center text-sm text-gray-500">
      Memuat...
    </div>
  );
}
