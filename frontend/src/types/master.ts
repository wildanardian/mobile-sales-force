// Dokter seperti yang dikirim di dalam Call List (CallListResource)
export interface Doctor {
  id: number;
  name: string;
  specialization: string;
}

// Baris master_customers utuh dari GET /doctors
export interface MasterCustomer extends Doctor {
  address: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

// Baris dari GET /products
export interface Product {
  id: number;
  name: string;
  category: string;
}
