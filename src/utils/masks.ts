export const maskCurrency = (value: string) => {
  let v = value.replace(/\D/g, "");
  if (!v) return "";
  v = (parseInt(v) / 100).toFixed(2);
  v = v.replace(".", ",");
  v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
  return `R$ ${v}`;
};

export const maskCnpjCpf = (value: string) => {
  let v = value.replace(/\D/g, "");
  if (v.length <= 11) {
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  } else {
    v = v.replace(/^(\d{2})(\d)/, "$1.$2");
    v = v.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
    v = v.replace(/\.(\d{3})(\d)/, ".$1/$2");
    v = v.replace(/(\d{4})(\d{1,2})$/, "$1-$2");
  }
  return v;
};

export const maskPhone = (value: string) => {
  let v = value.replace(/\D/g, "");
  v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
  v = v.replace(/(\d)(\d{4})$/, "$1-$2");
  return v;
};

export const maskCep = (value: string) => {
  let v = value.replace(/\D/g, "");
  v = v.replace(/^(\d{5})(\d)/, "$1-$2");
  return v;
};

export const maskDate = (value: string) => {
  let v = value.replace(/\D/g, "").substring(0, 8);
  if (v.length > 4) {
    v = v.replace(/^(\d{2})(\d{2})(\d+)/, "$1/$2/$3");
  } else if (v.length > 2) {
    v = v.replace(/^(\d{2})(\d+)/, "$1/$2");
  }
  return v;
};

export const maskCreci = (value: string) => {
  // Campo livre v39: aceita alphanumeric, pontos e traços. Max 15.
  return value.substring(0, 15);
};
