from fastapi import APIRouter, File, UploadFile, HTTPException
import pandas as pd
import io

router = APIRouter(prefix="/upload", tags=["ETL Upload"])

@router.post("/")
async def upload_attendance_file(file: UploadFile = File(...)):
    # Validar a extensão do ficheiro
    if not file.filename.endswith(('.csv', '.xlsx', '.xls')):
        raise HTTPException(
            status_code=400, 
            detail="Formato inválido. Por favor, envie um ficheiro CSV ou Excel (.xlsx/.xls)."
        )
    
    try:
        # Ler o conteúdo binário do ficheiro enviado
        contents = await file.read()
        
        # Processar o ficheiro consoante a extensão usando o Pandas
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        else:
            df = pd.read_excel(io.BytesIO(contents))
        
        # --- ETAPA DE ETL (Transformação e Limpeza Básica) ---
        df = df.dropna(how="all")
        
        total_registos = len(df)
        colunas_encontradas = list(df.columns)
        
        return {
            "filename": file.filename,
            "status": "sucesso",
            "total_registos_processados": total_registos,
            "colunas": colunas_encontradas,
            "amostra_dados": df.head(5).to_dict(orient="records")
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao processar o ficheiro: {str(e)}")