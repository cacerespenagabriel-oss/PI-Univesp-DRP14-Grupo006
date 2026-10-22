from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd
import io

router = APIRouter(prefix="/frequencia", tags=["Frequência"])

@router.post("/upload")
async def upload_frequencia(file: UploadFile = File(...)):
    """Recebe um arquivo .xlsx ou .csv e simula o processamento dos dados."""
    if not (file.filename.endswith(".csv") or file.filename.endswith(".xlsx")):
        raise HTTPException(status_code=400, detail="Formato de arquivo inválido. Envie um .csv ou .xlsx.")

    contents = await file.read()
    
    try:
        # Tenta ler como Excel ou CSV via Pandas
        if file.filename.endswith(".xlsx"):
            df = pd.read_excel(io.BytesIO(contents))
        else:
            df = pd.read_csv(io.BytesIO(contents))
            
        total_linhas = len(df)
        
        return {
            "mensagem": "Arquivo processado com sucesso!",
            "nome_arquivo": file.filename,
            "total_registros_encontrados": total_linhas
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao ler o arquivo: {str(e)}")