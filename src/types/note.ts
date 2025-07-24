interface INoteRecord {
  id: number;
  cate_id: number;
  title: string;
  content: string;
  src: string;
  status: number;
  file_ids: string;
  role_type: number;
  role_dids: string;
  role_uids: string;
  start_time: number;
  end_time: number;
  admin_id: number;
  create_time: number;
  update_time: number;
  delete_time: number;
}

interface INoteCreateRecord {
  id: number;
  cate_id: number;
  title: string;
  content: string;
  src: string;
  status: number;
  file_ids: string;
  role_type: number;
  role_dids: string;
  role_uids: string;
  start_time: number;
  end_time: number;
  admin_id: number;
  create_time: number;
  update_time: number;
  delete_time: number;
}

export interface UpdateNoteData {
  cate_id?: number;
  title?: string;
  content?: string;
  src?: string;
  status?: number;
  file_ids?: string;
  role_type?: number;
  role_dids?: string;
  role_uids?: string;
  start_time?: number;
  end_time?: number;
  admin_id?: number;
  create_time?: number;
  update_time?: number;
  delete_time?: number;
}